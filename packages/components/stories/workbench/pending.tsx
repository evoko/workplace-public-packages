/**
 * What the workbench bar (Bar.tsx) and its Inspect dialog (InspectDialog.tsx) both show: a pending
 * edit (the key, what the variant drew before → what it is set to, the reason to keep it with, the
 * reason it replaces and the rules that borrow it, Keep and Undo), failing checks, and Send to
 * agent beside them. One set of blocks, so the bar and the dialog's strip cannot differ.
 */

import Typography from '@mui/material/Typography';
import { Button } from '../../src/Button.js';
import { TextArea } from '../../src/TextArea.js';
import type { Failure, Pending, SetValue } from './client.js';

export const valueText = (v: SetValue) =>
  'token' in v ? v.token : 'keyword' in v ? v.keyword : 'none';

/**
 * A failing check in words: its message, else `<platform>: <variant> <layer>.<property>: Figma
 * <figma>, drawn <drawn>`, each part left out where the failure has none.
 */
export const failureText = (f: Failure) => {
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

/** What sending a failing Keep's checks does to the checks. */
export const KEPT =
  "its checks, and CI's, fail until /solar-feedback settles the note.";

/**
 * Send to agent, beside the failing checks it carries: an optional note, and the button. Offered
 * only where the component may change (the agent works on no other).
 */
export function SendToAgent({
  note,
  onNote,
  disabled,
  onSend,
  fromKeep,
}: {
  note: string;
  onNote: (note: string) => void;
  disabled: boolean;
  onSend: () => void;
  /** Whether the checks are a failing Keep's, whose edit sending keeps. */
  fromKeep: boolean;
}) {
  return (
    <>
      <TextArea
        size="sm"
        label="Agent note (optional)"
        helper={
          fromKeep
            ? `Why the component is right as it is, or what to fix. Sending keeps the edit with its reason (Undo goes); ${KEPT}`
            : 'Why the component is right as it is, or what to fix. The failing checks go with it.'
        }
        value={note}
        onChange={(event) => onNote(event.target.value)}
      />
      <div style={row}>
        <Button size="sm" prio="primary" disabled={disabled} onClick={onSend}>
          Send to agent
        </Button>
      </div>
    </>
  );
}

export function FailureList({ failures }: { failures: Failure[] }) {
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

/**
 * A pending edit: its key, what the variant in view drew before and what it is set to (a deleting
 * edit: Figma's value, and no reason to give), the reason field with the reason it replaces, the
 * rules that borrow that reason, the failing checks of a Keep and Send to agent beside them, and
 * Keep and Undo.
 */
export function PendingEdit({
  pending,
  reason,
  onReason,
  agentNote,
  onAgentNote,
  working,
  canSend,
  onKeep,
  onUndo,
  onSend,
  summary,
}: {
  pending: Pending;
  /**
   * The first line where the viewer can say more than the key (the dialog's strip names the layer,
   * the cell and the scope in plain words); by default, the key, what it was and what it becomes.
   */
  summary?: string;
  reason: string;
  onReason: (reason: string) => void;
  agentNote: string;
  onAgentNote: (note: string) => void;
  /** An action is running: the buttons wait. */
  working: boolean;
  /** Whether the component may change, so the agent may be sent its failing checks. */
  canSend: boolean;
  onKeep: () => void;
  onUndo: () => void;
  onSend: (failures: Failure[]) => void;
}) {
  const from = !pending.deletes && pending.was ? `${pending.was} → ` : '';
  return (
    <>
      <Typography variant="bodyXsRegular" style={secondary}>
        {summary ?? (
          <>
            Pending: {pending.key}
            {from ? ': ' : ' → '}
            {from}
            {pending.deletes
              ? "Figma's value (the rule is removed)"
              : valueText(pending.value)}
          </>
        )}
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
          onChange={(event) => onReason(event.target.value)}
        />
      )}
      {!pending.deletes && pending.borrowers.length > 0 && (
        <Typography variant="bodyXsRegular" style={secondary}>
          Also the reason of: {pending.borrowers.join(', ')}
        </Typography>
      )}
      {pending.failing && <FailureList failures={pending.failing} />}
      {pending.failing && canSend && (
        <SendToAgent
          note={agentNote}
          onNote={onAgentNote}
          disabled={working}
          onSend={() => onSend(pending.failing ?? [])}
          fromKeep
        />
      )}
      <div style={row}>
        <Button
          size="sm"
          // Where the checks failed, Send to agent is the step it leads with.
          prio={pending.failing && canSend ? 'secondary' : 'primary'}
          disabled={working}
          onClick={onKeep}
        >
          Keep
        </Button>
        <Button size="sm" prio="tertiary" disabled={working} onClick={onUndo}>
          Undo
        </Button>
      </div>
    </>
  );
}

export const row = {
  display: 'flex',
  flexWrap: 'wrap' as const,
  alignItems: 'center',
  gap: 'var(--solar-inset-xs)',
};
export const column = {
  display: 'flex',
  flexDirection: 'column' as const,
  gap: 'var(--solar-stack-sm)',
};
export const primary = { color: 'var(--solar-color-text-primary)' };
export const secondary = { color: 'var(--solar-color-text-secondary)' };
export const alert = { color: 'var(--solar-color-text-feedback-danger)' };
const list = { ...secondary, margin: 0, paddingLeft: 'var(--solar-inset-md)' };
