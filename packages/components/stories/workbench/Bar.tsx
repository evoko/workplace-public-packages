/**
 * The workbench bar above a component's Playground (docs/superpowers/specs/
 * 2026-09-27-viewer-workbench-design.md): its circle on this platform, and by it Inspect, Report
 * and Approve (🟡), Undo approval (🟢), or what it waits on (🔴). Inspect and Report are sections,
 * one open at a time; Report's note is its own, so it may be saved beside a pending edit.
 * Everything it changes goes through the workbench service (client.ts); it renders nothing where no
 * service answers. Drawn with SOLAR's own components. It behaves as Widgetbook's bar
 * (widgetbook/lib/workbench/bar.dart) does, which the scenarios in
 * codegen/src/workbench/bar-scenarios.json, run by both bars' tests, enforce.
 *
 * A refusal is shown once, as the action's own answer: the service also tells every viewer it
 * failed (a `failed` event), on which the bar only refetches. Every action refetches when it ends.
 */

import Typography from '@mui/material/Typography';
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type RefObject,
} from 'react';
import { Button } from '../../src/Button.js';
import { ConfirmationDialog } from '../../src/ConfirmationDialog.js';
import { DropdownItem } from '../../src/DropdownItem.js';
import { Select } from '../../src/Select.js';
import { TextArea } from '../../src/TextArea.js';
import {
  isStarting,
  type Cell,
  type ComponentStatus,
  type Failure,
  type Inspection,
  type Platform,
  type SetValue,
  type Status,
  type WorkbenchClient,
} from './client.js';
import { layerAt } from './pick.js';

const CIRCLE = { green: '🟢', yellow: '🟡', red: '🔴' } as const;

/** How long the bar waits before asking a service that is still starting, or whose poll failed. */
const RETRY_MS = 1000;
const wait = (ms: number) => new Promise((ok) => setTimeout(ok, ms));

type Dialog = null | 'approve' | 'unapprove';

/** The section open below the bar's buttons: none, Inspect's panel, or Report's note. */
type Section = 'none' | 'inspect' | 'report';

/** A set value as the Select writes it: a token's name, `FILL`, `HUG` or `none`. */
const valueOf = (choice: string): SetValue =>
  choice === 'none'
    ? { none: true }
    : choice === 'FILL' || choice === 'HUG'
      ? { keyword: choice }
      : { token: choice };

const valueText = (v: SetValue) =>
  'token' in v ? v.token : 'keyword' in v ? v.keyword : 'none';

const platformTitle = (platform: Platform) =>
  platform === 'web' ? 'the web' : 'Flutter';

/**
 * Whether a component may be inspected, and reported on, on this platform: 🟡 here, and locked
 * nowhere.
 */
const inspectable = (mine: ComponentStatus | undefined, platform: Platform) =>
  mine?.[platform] === 'yellow' && mine.editable;

/**
 * A failing check in words: its message, else `<platform>: <variant> <layer>.<property>: Figma
 * <figma>, drawn <drawn>`, each part left out where the failure has none.
 */
const failureText = (f: Failure) => {
  if (f.message) return f.message;
  const at = [f.layer, f.property].filter(Boolean).join('.');
  const where = [f.variant, at].filter(Boolean).join(' ');
  const seen = [
    f.figma === undefined ? null : `Figma ${JSON.stringify(f.figma)}`,
    f.drawn === undefined ? null : `drawn ${JSON.stringify(f.drawn)}`,
  ]
    .filter(Boolean)
    .join(', ');
  return [f.platform, where, seen].filter(Boolean).join(': ');
};

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

function FailureList({ failures }: { failures: Failure[] }) {
  return (
    <Typography
      component="ul"
      variant="bodyXsRegular"
      aria-label="Failing checks"
      style={list}
    >
      {failures.map((f, i) => (
        <li key={i}>{failureText(f)}</li>
      ))}
    </Typography>
  );
}

export function WorkbenchBar({
  component,
  platform,
  controls,
  client,
  box,
}: {
  component: string;
  platform: Platform;
  /** The Playground's values, by control: what a Report note records. */
  controls: Record<string, unknown>;
  client: WorkbenchClient;
  /** The Playground's width box, for pointing at a layer. */
  box?: RefObject<HTMLElement | null>;
}) {
  const [alive, setAlive] = useState(false);
  const [status, setStatus] = useState<Status | null>(null);
  const [inspection, setInspection] = useState<Inspection | null>(null);
  const [variant, setVariant] = useState(0);
  const [layer, setLayer] = useState('root');
  const [section, setSection] = useState<Section>('none');
  const [reason, setReason] = useState('');
  const [note, setNote] = useState('');
  // The file the last note was saved in, until the next action or Report closes.
  const [saved, setSaved] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [failures, setFailures] = useState<Failure[] | null>(null);
  const [dialog, setDialog] = useState<Dialog>(null);
  // Kept while the Undo approval dialog closes, so its words stay until it has gone.
  const [withdraws, setWithdraws] = useState<string[]>([]);
  const [pointing, setPointing] = useState(false);
  const [working, setWorking] = useState(false);
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
  const panelShown = Boolean(
    canInspect && inspecting && inspection && !status?.pending,
  );
  // The component locked or approved meanwhile: Inspect or Report closes, and opens again only when
  // asked.
  if (status && section !== 'none' && !canInspect) setSection('none');
  // Pointing holds only while the panel it points for shows.
  if (pointing && !panelShown) setPointing(false);

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
          setStatus(first);
          setAlive(true);
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
  }, [client]);

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
  }, [alive, inspecting, canInspect, client, component, variant]);

  // Long-poll the service's events; each change (or failure) refetches, each busy the status. The
  // poll waiting is ended when the bar goes.
  useEffect(() => {
    if (!alive) return undefined;
    let live = true;
    const stop = new AbortController();
    const loop = async () => {
      while (live) {
        try {
          const { seq: next, events } = await client.events(
            seq.current,
            stop.signal,
          );
          if (!live) return;
          seq.current = next;
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

  // Pointing: the next click in the box selects the layer under it.
  useEffect(() => {
    const el = box?.current;
    if (!pointing || !panelShown || !el || !inspection) return undefined;
    const classes = Object.fromEntries(
      inspection.layers.map((l) => [l.name, l.className]),
    );
    const onClick = (event: MouseEvent) => {
      event.preventDefault();
      event.stopPropagation();
      setLayer(layerAt(event.target as HTMLElement, el, classes));
      setPointing(false);
    };
    el.addEventListener('click', onClick, true);
    return () => el.removeEventListener('click', onClick, true);
  }, [box, pointing, panelShown, inspection]);

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
  const anyPending = status.pending;
  const pending = anyPending?.component === component ? anyPending : null;

  /** Runs an action: its refusal shown, and what the service holds then read again. */
  const act = async (fn: () => Promise<unknown>) => {
    setError(null);
    setFailures(null);
    setSaved(null);
    setPointing(false);
    setWorking(true);
    try {
      await fn();
      await refresh();
    } catch (e) {
      setError((e as Error).message);
      await refresh().catch(() => {});
    } finally {
      setWorking(false);
    }
  };
  const cells = inspection?.layers.find((l) => l.name === layer)?.cells ?? [];
  /** Opens a section, or closes it where it is the one open. */
  const toggle = (which: Section) => {
    setSection(section === which ? 'none' : which);
    setSaved(null);
  };
  // Report names the layer and variant chosen in Inspect, where this component has been inspected.
  const inspected = inspection?.component === component ? inspection : null;
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
            onClick={() => toggle('inspect')}
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
            disabled={Boolean(anyPending) || working}
            onClick={() => setDialog('approve')}
          >
            Approve
          </Button>
        )}
        {colour === 'green' && (
          <Button
            size="sm"
            prio="tertiary"
            disabled={Boolean(anyPending) || working}
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

      {panelShown && inspection && (
        <div style={column}>
          <div style={row}>
            <Select
              size="sm"
              label="Variant"
              value={String(variant)}
              disabled={working}
              onChange={(_, v) => {
                chosen.current = Number(v);
                setVariant(Number(v));
              }}
            >
              {inspection.variants.map((v) => (
                <DropdownItem key={v.index} value={String(v.index)}>
                  {v.name}
                </DropdownItem>
              ))}
            </Select>
            <Select
              size="sm"
              label="Layer"
              value={layer}
              disabled={working}
              onChange={(_, v) => setLayer(v)}
            >
              {inspection.layers.map((l) => (
                <DropdownItem key={l.name} value={l.name}>
                  {l.hidden ? `${l.name} (hidden here)` : l.name}
                </DropdownItem>
              ))}
            </Select>
            {box && (
              <Button
                size="sm"
                prio={pointing ? 'secondary' : 'tertiary'}
                disabled={working}
                onClick={() => setPointing(!pointing)}
              >
                Point
              </Button>
            )}
          </div>
          {pointing && (
            <Typography variant="bodyXsRegular" style={secondary}>
              Click a part of the component to choose its layer.
            </Typography>
          )}
          {cells.map((c) => (
            <CellRow
              // A new variant or layer offers other scopes: the row starts again, at the narrowest.
              key={`${inspection.variant}:${layer}.${c.cell}`}
              cell={c}
              disabled={working}
              onSet={(scope, choice) =>
                act(() =>
                  client.set({
                    component,
                    variant: inspection.variant,
                    layer,
                    cell: c.cell,
                    scope,
                    value: valueOf(choice),
                    revision: inspection.revision,
                  }),
                )
              }
            />
          ))}
        </div>
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
              disabled={working || !note.trim()}
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

      {pending && (
        <div style={column}>
          <Typography variant="bodyXsRegular" style={secondary}>
            Pending: {pending.key} →{' '}
            {pending.deletes
              ? "Figma's value (the rule is removed)"
              : valueText(pending.value)}
          </Typography>
          {!pending.deletes && (
            <TextArea
              size="sm"
              label="Why (a reviewer must be able to check it)"
              helper={
                pending.previousReason
                  ? `Was: ${pending.previousReason}`
                  : undefined
              }
              value={reason}
              onChange={(event) => setReason(event.target.value)}
            />
          )}
          {!pending.deletes && pending.borrowers.length > 0 && (
            <Typography variant="bodyXsRegular" style={secondary}>
              Also the reason of: {pending.borrowers.join(', ')}
            </Typography>
          )}
          {pending.failing && <FailureList failures={pending.failing} />}
          <div style={row}>
            <Button
              size="sm"
              prio="primary"
              disabled={working}
              onClick={() =>
                act(async () => {
                  // Failing checks are the pending edit's, which the status then carries.
                  const r = await client.keep(component, reason);
                  if (r.ok) setReason('');
                })
              }
            >
              Keep
            </Button>
            <Button
              size="sm"
              prio="tertiary"
              disabled={working}
              onClick={() =>
                act(async () => {
                  await client.undo(component);
                  setReason('');
                })
              }
            >
              Undo
            </Button>
          </div>
        </div>
      )}

      {failures && <FailureList failures={failures} />}
      {error && (
        <Typography variant="bodyXsRegular" role="alert" style={alert}>
          {error}
        </Typography>
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

/** One cell: its entry and where it sits, then a scope and the value to set it to. */
function CellRow({
  cell,
  disabled,
  onSet,
}: {
  cell: Cell;
  disabled: boolean;
  onSet: (scope: string, choice: string) => void;
}) {
  // The narrowest look first: the variant in view (the scopes run from every variant to it).
  const [scope, setScope] = useState(cell.scopes.at(-1)?.key ?? '');
  const options = [
    ...cell.choices.map((c) => ({
      key: c.name,
      label: `${c.name} · ${c.value}`,
    })),
    ...cell.keywords.map((k) => ({ key: k, label: k })),
    ...(cell.none ? [{ key: 'none', label: 'none' }] : []),
  ];
  const where = cell.at ? ` [${cell.at}]` : '';
  if (cell.note)
    return (
      <Typography variant="bodyXsRegular" style={secondary}>
        {`${cell.cell}: ${cell.entry} (${cell.note})`}
      </Typography>
    );
  if (!options.length || !cell.scopes.length)
    return (
      <Typography variant="bodyXsRegular" style={secondary}>
        {`${cell.cell}: ${cell.entry}${where} (not editable here: use Report)`}
      </Typography>
    );
  return (
    <div style={column}>
      <Typography variant="bodyXsRegular" style={secondary}>
        {`${cell.cell}: ${cell.entry}${where}`}
      </Typography>
      <div style={row}>
        <Select
          size="sm"
          label="Scope"
          value={scope}
          disabled={disabled}
          onChange={(_, v) => setScope(v)}
        >
          {cell.scopes.map((s) => (
            <DropdownItem key={s.key} value={s.key}>
              {s.label}
            </DropdownItem>
          ))}
        </Select>
        <Select
          size="sm"
          label="Set to"
          value=""
          placeholder="Choose"
          disabled={disabled}
          onChange={(_, v) => onSet(scope, v)}
        >
          {options.map((o) => (
            <DropdownItem key={o.key} value={o.key}>
              {o.label}
            </DropdownItem>
          ))}
        </Select>
      </div>
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
const row = {
  display: 'flex',
  flexWrap: 'wrap' as const,
  alignItems: 'center',
  gap: 'var(--solar-inset-xs)',
};
const column = {
  display: 'flex',
  flexDirection: 'column' as const,
  gap: 'var(--solar-stack-sm)',
};
const primary = { color: 'var(--solar-color-text-primary)' };
const secondary = { color: 'var(--solar-color-text-secondary)' };
const list = { ...secondary, margin: 0, paddingLeft: 'var(--solar-inset-md)' };
const alert = { color: 'var(--solar-color-text-feedback-danger)' };
