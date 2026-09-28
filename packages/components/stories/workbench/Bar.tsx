/**
 * The workbench bar above a component's Playground (docs/engineering/workflows.md, Fix a component
 * in the viewer): its circle on this platform, and by it Inspect, Report
 * and Approve (🟡), Undo approval (🟢), or what it waits on (🔴). Inspect opens a full-screen
 * dialog (InspectDialog.tsx), Report a note below the bar, one of the two open at a time; Report's
 * note is its own, so it may be saved beside a pending edit, and it names the layer and variant
 * last chosen in Inspect. Where checks fail (a Keep's or an Approve's) and the component may
 * change, Send to agent writes a note carrying them. An edit is drafted in the dialog and saved
 * there; a saved edit whose checks failed stays pending, shown in the bar and in the dialog's
 * strip while it is open (pending.tsx, one set of blocks for both), with Keep again and Undo.
 *
 * After a regeneration the service sends `reload`, on which the bar reloads the page (Storybook's
 * whole window: the preview iframe is rebuilt from the new files). It polls the events from the
 * seq its first status names and acts on every one it then hears, so it never hears an earlier
 * job's reload; one that starts while the status names a job still running (reloaded before its
 * checks' outcome) waits, as the bar that started it does, until a change ends it. Its first status read after it starts (never a
 * refresh) opens the dialog where the status's `reopen` names this viewer and component, within the
 * minute the service keeps it.
 * Everything it changes goes through the workbench service (client.ts); it renders nothing where no
 * service answers. Drawn with SOLAR's own components. It behaves as Widgetbook's bar
 * (widgetbook/lib/workbench/bar.dart) does, which the scenarios in
 * codegen/src/workbench/bar-scenarios.json, run by both bars' tests, enforce.
 *
 * A refusal is shown once, as the action's own answer: the service also tells every viewer it
 * failed (a `failed` event), on which the bar only refetches. Every action refetches when it ends.
 */

import Typography from '@mui/material/Typography';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Button } from '../../src/Button.js';
import { ConfirmationDialog } from '../../src/ConfirmationDialog.js';
import { TextArea } from '../../src/TextArea.js';
import {
  isStarting,
  type ComponentStatus,
  type Failure,
  type Inspection,
  type Platform,
  type Status,
  type WorkbenchClient,
} from './client.js';
import { InspectDialog, pendingSummary } from './InspectDialog.js';
import {
  FailureList,
  KEPT,
  PendingEdit,
  SendToAgent,
  alert,
  column,
  primary,
  row,
  secondary,
  valueOf,
} from './pending.js';
import type { DrawVariant } from './preview.js';

const CIRCLE = { green: '🟢', yellow: '🟡', red: '🔴' } as const;

/** How long the bar waits before asking a service that is still starting, or whose poll failed. */
const RETRY_MS = 1000;
/** How long after a regeneration a starting bar reopens its dialog where the edit was. */
const REOPEN_MS = 60_000;
/**
 * Reloads the viewer: Storybook's whole window where the bar is in its preview iframe. Said in the
 * console, so a reload the bar makes can be told from the ones Vite makes as files change.
 */
const reloadViewer = (seq: number) => {
  // eslint-disable-next-line no-console -- dev-only: which reloads are the bar's (Vite logs its own)
  console.info(`[workbench] reloading for the service's reload event ${seq}`);
  try {
    (window.top ?? window).location.reload();
  } catch {
    window.location.reload();
  }
};
const wait = (ms: number) => new Promise((ok) => setTimeout(ok, ms));

type Dialog = null | 'approve' | 'unapprove';

/** What is open beside the bar's buttons: nothing, Inspect's dialog, or Report's note below. */
type Section = 'none' | 'inspect' | 'report';

const platformTitle = (platform: Platform) =>
  platform === 'web' ? 'the web' : 'Flutter';

/**
 * Whether a component may be inspected, and reported on, on this platform: 🟡 here, and locked
 * nowhere.
 */
const inspectable = (mine: ComponentStatus | undefined, platform: Platform) =>
  mine?.[platform] === 'yellow' && mine.editable;

/**
 * What a 🔴 component waits on, in the same words as Widgetbook's bar: the 🟡 components among
 * what it waits on, to approve first; where none is 🟡, it is in a cycle with them.
 */
const waitsText = (status: Status, waitsOn: string[], platform: Platform) => {
  const first = waitsOn.filter(
    (n) => status.components[n]?.[platform] === 'yellow',
  );
  return first.length
    ? `Approve first: ${first.join(', ')}.`
    : `It is in a cycle with: ${waitsOn.join(', ')}.`;
};

export function WorkbenchBar({
  component,
  platform,
  controls,
  client,
  drawVariant,
}: {
  component: string;
  platform: Platform;
  /** The Playground's values, by control: what a Report note records. */
  controls: Record<string, unknown>;
  client: WorkbenchClient;
  /** Draws one of the component's oracle variants: Inspect's preview (solar.tsx `VariantStage`). */
  drawVariant: DrawVariant;
}) {
  const [alive, setAlive] = useState(false);
  const [status, setStatus] = useState<Status | null>(null);
  const [inspection, setInspection] = useState<Inspection | null>(null);
  const [variant, setVariant] = useState(0);
  const [layer, setLayer] = useState('root');
  const [section, setSection] = useState<Section>('none');
  // The cell the dialog opens with, where it reopens after a reload.
  const [reopenCell, setReopenCell] = useState<string | null>(null);
  const [note, setNote] = useState('');
  // Send to agent's note, its own: Report's may be open beside it.
  const [agentNote, setAgentNote] = useState('');
  // The file the last note was saved in, until the next action or Report closes.
  const [saved, setSaved] = useState<string | null>(null);
  // The file the last Send to agent wrote, and whether it kept a failing Keep's edit, until the next
  // action.
  const [sent, setSent] = useState<{ file: string; fromKeep: boolean } | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);
  const [failures, setFailures] = useState<Failure[] | null>(null);
  const [dialog, setDialog] = useState<Dialog>(null);
  // Kept while the Undo approval dialog closes, so its words stay until it has gone.
  const [withdraws, setWithdraws] = useState<string[]>([]);
  const [working, setWorking] = useState(false);
  // Started while the status named a job still running (reloaded before its checks' outcome): the
  // actions that start another wait, as they do in the bar that started it, until a change ends it.
  const [joined, setJoined] = useState(false);
  // How many times Inspect has been pressed: each press reads the inspection again.
  const [opens, setOpens] = useState(0);
  const seq = useRef(0);
  // The variant last chosen: an inspection read for another is dropped.
  const chosen = useRef(0);
  const header = useRef<HTMLElement>(null);
  // After Approve or Undo approval: the colour it started from, for the focus to follow.
  const refocus = useRef<string | null>(null);

  const mine = status?.components[component];
  const colour = mine ? mine[platform] : null;
  const canInspect = inspectable(mine, platform);
  const inspecting = section === 'inspect';
  // The component locked or approved meanwhile: Inspect or Report closes, and opens again only when
  // asked.
  if (status && section !== 'none' && !canInspect) setSection('none');

  // What the bar shows, read again: the circles, and while Inspect is open, the inspection.
  const refresh = useCallback(async () => {
    const now = await client.status();
    setStatus(now);
    if (!inspecting || !inspectable(now.components[component], platform))
      return;
    const v = chosen.current;
    const read = await client.inspect(component, v);
    if (chosen.current === v) setInspection(read);
  }, [client, component, platform, inspecting]);
  // The events' loop reads the latest, so choosing a variant never starts a second long poll.
  const latest = useRef(refresh);
  useEffect(() => {
    latest.current = refresh;
  }, [refresh]);

  // The service answers, or the bar stays away; one still starting is asked again, every second.
  useEffect(() => {
    let live = true;
    const start = async () => {
      while (live) {
        if (!(await client.health())) return;
        try {
          const first = await client.status();
          if (!live) return;
          // The events are polled from here on: those before this status were already in it.
          seq.current = first.seq ?? 0;
          setStatus(first);
          setJoined(Boolean(first.busy));
          setAlive(true);
          // Started (a reload among them) within a minute of this viewer's save, keep again or
          // undo: the dialog opens where it was. Read in this first status alone, never on a
          // refresh, so the page that saved opens nothing before it reloads.
          const at = first.reopen;
          if (
            at &&
            at.platform === platform &&
            at.component === component &&
            at.age <= REOPEN_MS
          ) {
            chosen.current = at.variant;
            setVariant(at.variant);
            setLayer(at.layer);
            setReopenCell(at.cell);
            setSection('inspect');
          }
          return;
        } catch (e) {
          if (!isStarting(e)) {
            if (live) setError((e as Error).message);
            return;
          }
          await wait(RETRY_MS);
        }
      }
    };
    void start();
    return () => {
      live = false;
    };
  }, [client, component, platform]);

  // Inspect open, another variant or component: the inspection read again.
  useEffect(() => {
    if (!alive || !inspecting || !canInspect) return undefined;
    let live = true;
    client
      .inspect(component, variant)
      .then((read) => {
        if (live && chosen.current === variant) setInspection(read);
      })
      .catch((e: Error) => {
        if (live) setError(e.message);
      });
    return () => {
      live = false;
    };
  }, [alive, inspecting, canInspect, client, component, variant, opens]);

  // Long-poll the service's events; each change (or failure) refetches, each busy the status. The
  // poll waiting is ended when the bar goes.
  useEffect(() => {
    if (!alive) return undefined;
    let live = true;
    const stop = new AbortController();
    const loop = async () => {
      // From the seq the first status named: every event after it is news, never an earlier job's.
      while (live) {
        try {
          const { seq: next, events } = await client.events(
            seq.current,
            stop.signal,
          );
          if (!live) return;
          seq.current = next;
          // A regeneration has finished: the viewer starts again from the new files.
          const reload = events.find((e) => e.type === 'reload');
          if (reload) {
            reloadViewer(reload.seq);
            return;
          }
          if (events.some((e) => e.type === 'changed')) setJoined(false);
          if (events.some((e) => e.type !== 'busy')) await latest.current();
          else if (events.length) setStatus(await client.status());
        } catch {
          if (!live) return;
          await wait(RETRY_MS);
        }
      }
    };
    void loop();
    return () => {
      live = false;
      stop.abort();
    };
  }, [alive, client]);

  // After Approve or Undo approval has ended: the focus, lost with the button that went, or left on
  // the page, goes to the bar's header.
  useEffect(() => {
    if (refocus.current === null || working) return;
    const before = refocus.current;
    refocus.current = null;
    const lost =
      !document.activeElement || document.activeElement === document.body;
    if (lost || colour !== before) header.current?.focus();
  });

  if (!alive)
    return error ? (
      <Typography variant="bodyXsRegular" role="alert" style={alert}>
        Workbench: {error}
      </Typography>
    ) : null;
  if (!status || !mine) return null;
  // An action runs: this bar's own, or the job it started beside.
  const waiting = working || joined;
  const anyPending = status.pending;
  const pending = anyPending?.component === component ? anyPending : null;

  /**
   * Runs an action: its refusal shown, and what the service holds then read again. Whether it was
   * taken.
   */
  const act = async (fn: () => Promise<unknown>) => {
    setError(null);
    setFailures(null);
    setSaved(null);
    setSent(null);
    setWorking(true);
    try {
      await fn();
      await refresh();
      return true;
    } catch (e) {
      setError((e as Error).message);
      await refresh().catch(() => {});
      return false;
    } finally {
      setWorking(false);
    }
  };
  /** Opens a section, or closes it where it is the one open. */
  const toggle = (which: Section) => {
    setSection(section === which ? 'none' : which);
    setSaved(null);
  };
  // Report names the layer and variant chosen in Inspect, where this component has been inspected.
  const inspected = inspection?.component === component ? inspection : null;
  // The dialog, once the inspection it shows has been read; it holds the pending edit, the failures
  // and the errors while it is open.
  const dialogShown = Boolean(canInspect && inspecting && inspected);
  // A variant that does not draw the layer in view: the root, which Change to and Report then name.
  if (inspected && !inspected.layers.some((l) => l.name === layer))
    setLayer('root');
  const saveNote = () =>
    act(async () => {
      const { file } = await client.report({
        component,
        platform,
        controls,
        ...(inspected && {
          layer,
          variant: inspected.variants.find((v) => v.index === inspected.variant)
            ?.name,
        }),
        note,
      });
      setNote('');
      setSaved(file);
    });

  /**
   * Send to agent: the failing checks shown, a Keep's (whose edit is then no longer pending) or an
   * Approve's, with the note, even none. Refused, the checks stay shown, to send again.
   */
  const sendToAgent = (shown: Failure[]) =>
    act(async () => {
      try {
        const { file } = await client.send({
          component,
          platform,
          note: agentNote,
          failures: shown,
        });
        setAgentNote('');
        setSent({ file, fromKeep: Boolean(pending) });
      } catch (e) {
        if (!pending) setFailures(shown);
        throw e;
      }
    });

  /** The pending edit's block, as the bar and the dialog's strip both show it. */
  const pendingProps = (edit: NonNullable<typeof pending>) => ({
    pending: edit,
    agentNote,
    onAgentNote: setAgentNote,
    working: waiting,
    canSend: canInspect,
    // Failing checks are the pending edit's, which the status then carries.
    onKeep: () => void act(() => client.keep(component, platform)),
    onUndo: () => void act(() => client.undo(component, platform)),
    onSend: (shown: Failure[]) => void sendToAgent(shown),
  });
  const sentNotice = sent && (
    <Typography variant="bodyXsRegular" aria-live="polite" style={secondary}>
      Saved: {sent.file}
      {sent.fromKeep && `. The edit is kept; ${KEPT}`}
    </Typography>
  );

  return (
    <div style={bar} role="region" aria-label="Workbench">
      <div style={row}>
        <Typography
          ref={header}
          tabIndex={-1}
          aria-live="polite"
          variant="labelSm"
          style={primary}
        >
          {colour ? CIRCLE[colour] : ''} Workbench
          {status.busy ? ` · ${status.busy}` : ''}
        </Typography>
        {canInspect && (
          <Button
            size="sm"
            prio={inspecting ? 'secondary' : 'tertiary'}
            onClick={() => {
              // Opens the dialog, reading the inspection again (also after a read was refused).
              setSection('inspect');
              setReopenCell(null);
              setOpens((n) => n + 1);
              setSaved(null);
              setError(null);
            }}
          >
            Inspect
          </Button>
        )}
        {canInspect && (
          <Button
            size="sm"
            prio={section === 'report' ? 'secondary' : 'tertiary'}
            onClick={() => toggle('report')}
          >
            Report
          </Button>
        )}
        {colour === 'yellow' && (
          <Button
            size="sm"
            prio="tertiary"
            disabled={Boolean(anyPending) || waiting}
            onClick={() => setDialog('approve')}
          >
            Approve
          </Button>
        )}
        {colour === 'green' && (
          <Button
            size="sm"
            prio="tertiary"
            disabled={Boolean(anyPending) || waiting}
            onClick={() =>
              act(async () => {
                setWithdraws(
                  await client.unapprovePreview(component, platform),
                );
                setDialog('unapprove');
              })
            }
          >
            Undo approval
          </Button>
        )}
      </div>

      {colour === 'red' && (
        <Typography variant="bodyXsRegular" style={secondary}>
          {waitsText(status, mine.waitsOn[platform], platform)}
        </Typography>
      )}
      {colour === 'yellow' && !mine.editable && mine.locked && (
        <Typography variant="bodyXsRegular" style={secondary}>
          Inspect and Report are locked: {mine.locked}.
        </Typography>
      )}
      {anyPending && !pending && colour !== 'red' && (
        <Typography variant="bodyXsRegular" style={secondary}>
          {anyPending.component} has a pending edit: keep or undo it in its
          Playground first.
        </Typography>
      )}

      {canInspect && section === 'report' && (
        <div style={column}>
          <TextArea
            size="sm"
            label="Note for the agent"
            helper="What Inspect cannot change: a behaviour, a raw value, a layout. The Playground's values go with it."
            value={note}
            onChange={(event) => setNote(event.target.value)}
          />
          <div style={row}>
            <Button
              size="sm"
              prio="primary"
              disabled={waiting || !note.trim()}
              onClick={() => void saveNote()}
            >
              Save note
            </Button>
          </div>
          {saved && (
            <Typography
              variant="bodyXsRegular"
              aria-live="polite"
              style={secondary}
            >
              Saved: {saved}
            </Typography>
          )}
        </div>
      )}

      {!dialogShown && pending && (
        <div style={column}>
          <PendingEdit {...pendingProps(pending)} />
        </div>
      )}
      {!dialogShown && failures && <FailureList failures={failures} />}
      {!dialogShown && failures && canInspect && (
        <SendToAgent
          note={agentNote}
          onNote={setAgentNote}
          disabled={waiting}
          onSend={() => void sendToAgent(failures)}
          fromKeep={false}
        />
      )}
      {!dialogShown && sentNotice}
      {!dialogShown && error && (
        <Typography variant="bodyXsRegular" role="alert" style={alert}>
          {error}
        </Typography>
      )}

      {dialogShown && inspected && (
        <InspectDialog
          component={component}
          inspection={inspected}
          layer={layer}
          editable={!anyPending && !waiting}
          working={waiting}
          busy={status.busy}
          pending={pending}
          otherPending={anyPending && !pending ? anyPending.component : null}
          error={error}
          notice={sentNotice}
          strip={
            pending && (
              <PendingEdit
                {...pendingProps(pending)}
                summary={pendingSummary(pending, inspected)}
              />
            )
          }
          drawVariant={drawVariant}
          onLayer={setLayer}
          onVariant={(index) => {
            chosen.current = index;
            setVariant(index);
          }}
          reopenCell={reopenCell}
          onSave={(cell, scope, choice, reason) =>
            act(() =>
              client.apply({
                component,
                platform,
                variant: inspected.variant,
                layer,
                cell,
                scope,
                value: valueOf(choice),
                revision: inspected.revision,
                reason,
              }),
            )
          }
          onReport={() => {
            setSection('report');
            setSaved(null);
          }}
          onClose={() => {
            setSection('none');
            setReopenCell(null);
          }}
        />
      )}

      <ConfirmationDialog
        open={dialog === 'approve'}
        title={`Approve ${component} on ${platformTitle(platform)}?`}
        description="You have checked that it looks and behaves as intended. Its checks run first."
        confirmLabel="Approve"
        onConfirm={() => {
          setDialog(null);
          void act(async () => {
            refocus.current = colour;
            const r = await client.approve(component, platform);
            if (!r.ok) setFailures(r.failures);
          });
        }}
        onCancel={() => setDialog(null)}
      />
      <ConfirmationDialog
        open={dialog === 'unapprove'}
        intent="danger"
        title={`Undo ${component}'s approval?`}
        description={`This withdraws the approval of ${withdraws.join(', ')} on ${platformTitle(platform)}.`}
        confirmLabel="Undo approval"
        onConfirm={() => {
          setDialog(null);
          void act(async () => {
            refocus.current = colour;
            await client.unapprove(component, platform);
          });
        }}
        onCancel={() => setDialog(null)}
      />
    </div>
  );
}

const bar = {
  display: 'flex',
  flexDirection: 'column' as const,
  alignSelf: 'stretch',
  gap: 'var(--solar-stack-sm)',
  padding: 'var(--solar-inset-sm)',
  border: 'var(--solar-border-default) solid var(--solar-color-border-subtle)',
  borderRadius: 'var(--solar-radius-control)',
};
