// What the workbench bar (bar.dart) and its Inspect dialog (inspect_dialog.dart) draw: the pending
// edit with Keep again and Undo; the draft with its reason, Save and Discard (the dialog's alone);
// the failing checks; Send to agent's note and button; and an error. One widget each, so the two cannot say it differently. Drawn with SOLAR's own
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

/// The one pending edit, where it is this component's: an edit saved whose checks failed (or were
/// never run, after a restart mid-save). The edit (what it drew before → what it sets), the reason
/// it was saved with, its failing checks with Send to agent where [canSend], and Keep again and
/// Undo; each action disabled where its callback is null. [wide] lays it out in columns (the
/// Inspect dialog's strip), else one under another (the bar).
class WorkbenchPendingBlock extends StatelessWidget {
  const WorkbenchPendingBlock({
    super.key,
    required this.pending,
    required this.agentNote,
    required this.canSend,
    required this.onKeep,
    required this.onUndo,
    required this.onSend,
    this.wide = false,
    this.title,
  });

  final WorkbenchPending pending;
  final TextEditingController agentNote;
  final bool canSend;

  /// Keep again, and Undo.
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
      if (!pending.deletes && pending.reason != null)
        Text('Saved with the reason: ${pending.reason}', style: small),
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
          'Keep again',
          onKeep,
          // Where the checks failed, Send to agent is the step the block leads with.
          prio: failing != null && canSend
              ? SolarButtonPrio.secondary
              : SolarButtonPrio.primary,
        ),
        workbenchButton('Undo', onUndo),
      ],
    );
    if (!wide || checks.isEmpty) return _column([...edit, ...checks, actions]);
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      spacing: SolarInset.md,
      children: [
        Expanded(child: _column([...edit, actions])),
        Expanded(child: _column(checks)),
      ],
    );
  }
}

/// The draft the Inspect dialog's editor made, before anything is sent: the edit in words, the
/// reason to save it with (the reason of the rule it replaces, and the rules that borrow it, under
/// the field), or, where it is Figma's own value, that the rule is removed and no reason is asked;
/// Save and Discard, each disabled where its callback is null.
class WorkbenchDraftBlock extends StatelessWidget {
  const WorkbenchDraftBlock({
    super.key,
    required this.title,
    required this.removes,
    required this.reason,
    required this.onReason,
    required this.onSave,
    required this.onDiscard,
    this.replaces,
    this.borrowers = const [],
    this.enabled = true,
  });

  final String title;

  /// Whether the draft is Figma's own value there: the rule's removal.
  final bool removes;
  final TextEditingController reason;
  final VoidCallback onReason;
  final VoidCallback? onSave, onDiscard;

  /// The reason of the rule the draft replaces, and the rules that borrow it.
  final String? replaces;
  final List<String> borrowers;

  /// Whether the reason may be typed (not while Save runs).
  final bool enabled;

  @override
  Widget build(BuildContext context) {
    final small = workbenchSmall(SolarTheme.of(context));
    return _column([
      Text(title, style: small),
      if (removes)
        Text(
          "Figma's own value here: the rule is removed, and needs no reason.",
          style: small,
        )
      else
        SolarTextArea(
          size: SolarTextAreaSize.sm,
          enabled: enabled,
          label: 'Why (a reviewer must be able to check it)',
          helper: [
            if (replaces != null) 'Was: $replaces',
            if (borrowers.isNotEmpty)
              'Also the reason of: ${borrowers.join(', ')}',
          ].join('\n').nonEmpty,
          controller: reason,
          onChanged: (_) => onReason(),
        ),
      Wrap(
        spacing: SolarInset.xs,
        runSpacing: SolarInset.xs,
        children: [
          workbenchButton('Save', onSave, prio: SolarButtonPrio.primary),
          workbenchButton('Discard', onDiscard),
        ],
      ),
    ]);
  }
}

extension on String {
  String? get nonEmpty => isEmpty ? null : this;
}

Widget _column(List<Widget> children) => Column(
  crossAxisAlignment: CrossAxisAlignment.start,
  mainAxisSize: MainAxisSize.min,
  spacing: SolarStack.sm,
  children: children,
);
