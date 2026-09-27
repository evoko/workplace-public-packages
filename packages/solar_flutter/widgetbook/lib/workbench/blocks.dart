// What the workbench bar (bar.dart) and its Inspect dialog (inspect_dialog.dart) both draw: the
// pending edit with its reason, Keep and Undo; the failing checks; Send to agent's note and button;
// and an error. One widget each, so the two cannot say it differently. Drawn with SOLAR's own
// widgets and tokens.

import 'package:flutter/material.dart';
import 'package:solar_flutter/solar_flutter.dart';

import 'models.dart';

/// What sending a failing Keep's checks does to the checks, as the web's bar says it.
const sentKeepsNote =
    "its checks, and CI's, fail until /solar-feedback settles the note.";

/// The workbench's small text: secondary, as the web's bar sets it.
TextStyle workbenchSmall(SolarTheme t) =>
    t.typography.bodyXsRegular.copyWith(color: t.colors.textSecondary);

/// A workbench button: small, tertiary unless [prio] says otherwise; disabled where [onPressed] is
/// null; focused through [focusNode] where given.
Widget workbenchButton(
  String label,
  VoidCallback? onPressed, {
  SolarButtonPrio prio = SolarButtonPrio.tertiary,
  FocusNode? focusNode,
}) => SolarButton(
  prio: prio,
  size: SolarButtonSize.sm,
  onPressed: onPressed,
  focusNode: focusNode,
  child: Text(label),
);

/// An error (a refusal, or a service that failed), announced as it appears, keyed for the tests
/// to find it by ([key]: WorkbenchBar.errorKey).
class WorkbenchAlert extends StatelessWidget {
  const WorkbenchAlert(this.text, {required this.textKey, super.key});

  final String text;
  final Key textKey;

  @override
  Widget build(BuildContext context) {
    final t = SolarTheme.of(context);
    return Semantics(
      liveRegion: true,
      child: Text(
        text,
        key: textKey,
        style: t.typography.bodyXsRegular.copyWith(
          color: t.colors.textFeedbackDanger,
        ),
      ),
    );
  }
}

/// The checks that failed, one line each.
class WorkbenchFailureList extends StatelessWidget {
  const WorkbenchFailureList(this.failures, {super.key});

  final List<WorkbenchFailure> failures;

  @override
  Widget build(BuildContext context) {
    final small = workbenchSmall(SolarTheme.of(context));
    return Semantics(
      container: true,
      label: 'Failing checks',
      child: Padding(
        padding: const EdgeInsetsDirectional.only(start: SolarInset.md),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            for (final f in failures) Text('• ${f.text}', style: small),
          ],
        ),
      ),
    );
  }
}

/// Send to agent, beside the failing checks it carries: an optional note, and the button, disabled
/// where [onSend] is null. [fromKeep]: the checks are a failing Keep's, whose edit sending keeps.
/// Offered only where the component may change (the agent works on no other).
class WorkbenchSendBlock extends StatelessWidget {
  const WorkbenchSendBlock({
    super.key,
    required this.note,
    required this.fromKeep,
    required this.onSend,
  });

  final TextEditingController note;
  final bool fromKeep;
  final VoidCallback? onSend;

  @override
  Widget build(BuildContext context) => Column(
    crossAxisAlignment: CrossAxisAlignment.start,
    mainAxisSize: MainAxisSize.min,
    spacing: SolarStack.sm,
    children: [
      SolarTextArea(
        size: SolarTextAreaSize.sm,
        label: 'Agent note (optional)',
        helper: fromKeep
            ? 'Why the component is right as it is, or what to fix. Sending keeps the edit with its reason (Undo goes); $sentKeepsNote'
            : 'Why the component is right as it is, or what to fix. The failing checks go with it.',
        controller: note,
      ),
      workbenchButton('Send to agent', onSend, prio: SolarButtonPrio.primary),
    ],
  );
}

/// The one pending edit, where it is this component's: the edit (what it drew before → what it
/// sets), the reason Keep records (the reason it replaces under it, and the rules that borrow it),
/// its failing checks with Send to agent where [canSend], and Keep and Undo; each action disabled
/// where its callback is null. [wide] lays it out in columns (the Inspect dialog's strip), else one
/// under another (the bar).
class WorkbenchPendingBlock extends StatelessWidget {
  const WorkbenchPendingBlock({
    super.key,
    required this.pending,
    required this.reason,
    required this.agentNote,
    required this.canSend,
    required this.onKeep,
    required this.onUndo,
    required this.onSend,
    this.wide = false,
    this.title,
  });

  final WorkbenchPending pending;
  final TextEditingController reason, agentNote;
  final bool canSend;
  final VoidCallback? onKeep, onUndo;

  /// Send to agent with the failing checks shown; null disables it.
  final VoidCallback? onSend;
  final bool wide;

  /// The edit in words, in place of its key's ([WorkbenchPending.text]): the Inspect dialog names
  /// the layer, the cell and the scope.
  final String? title;

  @override
  Widget build(BuildContext context) {
    final small = workbenchSmall(SolarTheme.of(context));
    final failing = pending.failing;
    final edit = [
      Text(title ?? pending.text, style: small),
      if (!pending.deletes)
        SolarTextArea(
          size: SolarTextAreaSize.sm,
          label: 'Why (a reviewer must be able to check it)',
          helper: pending.previousReason == null
              ? null
              : 'Was: ${pending.previousReason}',
          controller: reason,
        ),
      if (!pending.deletes && pending.borrowers.isNotEmpty)
        Text(
          'Also the reason of: ${pending.borrowers.join(', ')}',
          style: small,
        ),
    ];
    final checks = [
      if (failing != null) ...[
        WorkbenchFailureList(failing),
        if (canSend)
          WorkbenchSendBlock(note: agentNote, fromKeep: true, onSend: onSend),
      ],
    ];
    final actions = Wrap(
      spacing: SolarInset.xs,
      runSpacing: SolarInset.xs,
      children: [
        workbenchButton(
          'Keep',
          onKeep,
          // Where the checks failed, Send to agent is the step the block leads with.
          prio: failing != null && canSend
              ? SolarButtonPrio.secondary
              : SolarButtonPrio.primary,
        ),
        workbenchButton('Undo', onUndo),
      ],
    );
    Widget column(List<Widget> children) => Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      mainAxisSize: MainAxisSize.min,
      spacing: SolarStack.sm,
      children: children,
    );
    if (!wide) return column([...edit, ...checks, actions]);
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      spacing: SolarInset.md,
      children: [
        Expanded(child: column([...edit, actions])),
        if (checks.isNotEmpty) Expanded(child: column(checks)),
      ],
    );
  }
}
