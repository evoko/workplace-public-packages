// The workbench bar above a component's Playground, as the web's (stories/workbench/Bar.tsx): its
// circle on this platform, and by it Inspect and Approve (🟡), Undo approval (🟢), or what it waits
// on (🔴). Everything it changes goes through the workbench service (client.dart); it draws nothing
// where no service answers. Drawn with SOLAR's own widgets; no pointing at a layer (the web's alone).
//
// A refusal is shown once, as the action's own answer: the service also tells every viewer it
// failed (a `failed` event), on which the bar only refetches.

import 'dart:async';

import 'package:flutter/material.dart';
import 'package:solar_flutter/solar_flutter.dart';

import 'client.dart';
import 'models.dart';

const _circle = {'green': '🟢', 'yellow': '🟡', 'red': '🔴'};

/// How long the bar waits before asking a service that is still starting, or whose poll failed.
const _retry = Duration(seconds: 1);

class WorkbenchBar extends StatefulWidget {
  const WorkbenchBar({
    super.key,
    required this.component,
    required this.platform,
    required this.client,
  });

  /// The component's name, as the service and the oracles name it (`Button`, `ConfirmationDialog`).
  final String component;

  /// `flutter` in Widgetbook: the platform the bar approves on.
  final String platform;
  final WorkbenchClient client;

  @override
  State<WorkbenchBar> createState() => _WorkbenchBarState();
}

class _WorkbenchBarState extends State<WorkbenchBar> {
  bool _alive = false;
  bool _live = true;
  WorkbenchStatus? _status;
  WorkbenchInspection? _inspection;
  int _variant = 0;
  String _layer = 'root';
  bool _inspecting = false;

  /// Whether an action is running: every button and Select that starts another waits for it.
  bool _working = false;
  String? _error;
  List<WorkbenchFailure>? _failures;
  final _reason = TextEditingController();

  /// The header, which the focus goes to after Approve or Undo approval: focusable, though not in
  /// the traversal order (the web's `tabIndex={-1}`).
  final _header = FocusNode(
    debugLabel: 'Workbench header',
    skipTraversal: true,
  );

  /// The scope chosen for each cell, by `<variant>:<layer>.<cell>`; the narrowest (the last, the
  /// variant in view) until one is chosen. Forgotten, as the web's rows forget theirs, when the
  /// variant or the layer changes, a pending edit appears, or Inspect closes.
  final _scopes = <String, String>{};
  int _seq = 0;

  @override
  void initState() {
    super.initState();
    unawaited(_start());
  }

  @override
  void dispose() {
    _live = false;
    _reason.dispose();
    _header.dispose();
    super.dispose();
  }

  /// The service answers, or the bar stays away; one still starting (503) is asked again, every
  /// second, while it still answers: gone meanwhile, the bar stays away, quietly.
  Future<void> _start() async {
    while (mounted) {
      if (!await widget.client.health() || !mounted) return;
      try {
        final first = await widget.client.status();
        if (!mounted) return;
        setState(() {
          _setStatus(first);
          _alive = true;
        });
        unawaited(_poll());
        return;
      } on WorkbenchException catch (e) {
        if (e.status != 503) return _failed(e);
      } catch (e) {
        return _failed(e);
      }
      await Future<void>.delayed(_retry);
    }
  }

  /// Whether the component may be inspected in [status]: 🟡 here, and locked nowhere.
  bool _canInspect(WorkbenchStatus status) {
    final mine = status.components[widget.component];
    return mine?.colourOn(widget.platform) == 'yellow' && mine!.editable;
  }

  /// The status, in a setState: where the component was locked or approved meanwhile, Inspect
  /// closes, and opens again only when asked.
  void _setStatus(WorkbenchStatus status) {
    // A pending edit appearing: every row starts again at the narrowest, as the web's rows do.
    if (status.pending != null && _status?.pending == null) _scopes.clear();
    _status = status;
    if (_inspecting && !_canInspect(status)) {
      _inspecting = false;
      _scopes.clear();
    }
  }

  /// After Approve or Undo approval has ended: the focus, lost with the button that went (the
  /// circle changed) or left nowhere, goes to the header, as the web's does.
  void _refocus(String? before) {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (!mounted) return;
      final now = _status?.components[widget.component]?.colourOn(
        widget.platform,
      );
      final focus = FocusManager.instance.primaryFocus;
      final lost =
          focus == null || focus.context == null || focus is FocusScopeNode;
      if (lost || now != before) _header.requestFocus();
    });
  }

  /// A read that failed before the bar is up, shown as the workbench's.
  void _failed(Object e) {
    if (mounted) setState(() => _error = 'Workbench: $e');
  }

  /// A failure while the bar is up, shown bare, as an action's refusal is.
  void _show(Object e) {
    if (mounted) setState(() => _error = '$e');
  }

  /// The inspection of the variant in view; an answer for another variant (one chosen since) is
  /// dropped.
  Future<void> _inspect() async {
    final variant = _variant;
    final inspection = await widget.client.inspect(widget.component, variant);
    if (mounted && _inspecting && inspection.variant == _variant) {
      setState(() => _inspection = inspection);
    }
  }

  /// What the bar shows, read again: the circles, and while Inspect is open, the inspection.
  Future<void> _read() async {
    final status = await widget.client.status();
    if (!mounted) return;
    setState(() => _setStatus(status));
    if (_inspecting) await _inspect();
  }

  /// Long-polls the service's events: a change (or a failure, which the action that failed shows)
  /// reads everything again; `busy` alone, the status. A read that fails is silent, and asked again
  /// after a second.
  Future<void> _poll() async {
    while (_live && mounted) {
      try {
        final r = await widget.client.events(_seq);
        if (!_live || !mounted) return;
        _seq = r.seq;
        if (r.types.any((t) => t != 'busy')) {
          await _read();
        } else if (r.types.isNotEmpty) {
          final s = await widget.client.status();
          if (mounted) setState(() => _setStatus(s));
        }
      } catch (_) {
        await Future<void>.delayed(_retry);
      }
    }
  }

  /// Runs an action: its refusal is the one message shown; what it changed is read again after it,
  /// however it ended (a refused edit is undone).
  Future<void> _act(Future<void> Function() fn) async {
    if (_working) return;
    setState(() {
      _error = null;
      _failures = null;
      _working = true;
    });
    try {
      await fn();
      if (mounted) await _read();
    } catch (e) {
      if (mounted) setState(() => _error = '$e');
      try {
        if (mounted) await _read();
      } catch (_) {
        // The refusal is what is shown.
      }
    } finally {
      if (mounted) setState(() => _working = false);
    }
  }

  Future<bool> _confirm({
    required String title,
    required String description,
    required String confirm,
    bool danger = false,
  }) async {
    var yes = false;
    await showSolarDialog<void>(
      context: context,
      builder: (context) => SolarConfirmationDialog(
        intent: danger
            ? SolarConfirmationDialogIntent.danger
            : SolarConfirmationDialogIntent.$default,
        title: title,
        description: description,
        confirmLabel: confirm,
        onConfirm: () {
          yes = true;
          Navigator.of(context).pop();
        },
        onCancel: () => Navigator.of(context).pop(),
      ),
    );
    return yes;
  }

  String get _where => widget.platform == 'web' ? 'the web' : 'Flutter';

  /// A set value as the Select writes it: a token's name, `FILL`, `HUG` or `none`.
  Map<String, Object?> _valueOf(String choice) => choice == 'none'
      ? {'none': true}
      : choice == 'FILL' || choice == 'HUG'
      ? {'keyword': choice}
      : {'token': choice};

  Widget _button(
    String label,
    VoidCallback? onPressed, {
    SolarButtonPrio prio = SolarButtonPrio.tertiary,
  }) => SolarButton(
    prio: prio,
    size: SolarButtonSize.sm,
    onPressed: onPressed,
    child: Text(label),
  );

  void _toggleInspect() {
    setState(() {
      _inspecting = !_inspecting;
      if (!_inspecting) _scopes.clear();
    });
    if (_inspecting) unawaited(_inspect().catchError(_show));
  }

  /// Approve: the dialog first, then the approval, on confirming alone.
  Future<void> _approve() async {
    final yes = await _confirm(
      title: 'Approve ${widget.component} on $_where?',
      description: 'You have checked that it looks and behaves as intended. Its checks run first.',
      confirm: 'Approve',
    );
    if (!yes || !mounted) return;
    final before = _colour;
    await _act(() async {
      final r = await widget.client.approve(widget.component, widget.platform);
      if (!r.ok && mounted) setState(() => _failures = r.failures);
    });
    _refocus(before);
  }

  String? get _colour =>
      _status?.components[widget.component]?.colourOn(widget.platform);

  /// Undo approval, as the web's: what it withdraws read first (then the bar read again), the
  /// dialog, and the withdrawal on confirming alone; the bar is not working while the dialog is open.
  Future<void> _unapprove() async {
    List<String>? withdraws;
    await _act(() async {
      withdraws = await widget.client.unapprovePreview(
        widget.component,
        widget.platform,
      );
    });
    final names = withdraws;
    if (names == null || !mounted) return;
    final yes = await _confirm(
      title: "Undo ${widget.component}'s approval?",
      description:
          'This withdraws the approval of ${names.join(', ')} on $_where.',
      confirm: 'Undo approval',
      danger: true,
    );
    if (!yes || !mounted) return;
    final before = _colour;
    await _act(() async {
      await widget.client.unapprove(widget.component, widget.platform);
    });
    _refocus(before);
  }

  /// Keep: failing checks are the pending edit's, which the status then carries.
  void _keep() => unawaited(
    _act(() async {
      final r = await widget.client.keep(widget.component, _reason.text);
      if (r.ok) _reason.clear();
    }),
  );

  void _undo() => unawaited(
    _act(() async {
      await widget.client.undo(widget.component);
      _reason.clear();
    }),
  );

  /// What a 🔴 component waits on, in the web's words: the 🟡 components among them, to approve
  /// first; where none is 🟡, it is in a cycle with them.
  String _waitsText(WorkbenchStatus status, ComponentStatus mine) {
    final waitsOn = mine.waitsOn[widget.platform] ?? const <String>[];
    final first = [
      for (final n in waitsOn)
        if (status.components[n]?.colourOn(widget.platform) == 'yellow') n,
    ];
    return first.isNotEmpty
        ? 'Approve first: ${first.join(', ')}.'
        : 'It is in a cycle with: ${waitsOn.join(', ')}.';
  }

  Widget _failureList(List<WorkbenchFailure> failures, TextStyle small) =>
      Semantics(
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

  Widget _alert(String text, SolarTheme t) => Semantics(
    liveRegion: true,
    child: Text(
      text,
      style: t.typography.bodyXsRegular.copyWith(
        color: t.colors.textFeedbackDanger,
      ),
    ),
  );

  @override
  Widget build(BuildContext context) {
    final t = Theme.of(context).extension<SolarTheme>()!;
    final error = _error;
    if (!_alive) {
      return error == null ? const SizedBox.shrink() : _alert(error, t);
    }
    final status = _status;
    final mine = status?.components[widget.component];
    if (status == null || mine == null) return const SizedBox.shrink();
    final small = t.typography.bodyXsRegular.copyWith(
      color: t.colors.textSecondary,
    );
    final colour = mine.colourOn(widget.platform);
    final anyPending = status.pending;
    final pending = anyPending?.component == widget.component
        ? anyPending
        : null;
    final inspection = _inspection;
    final cells =
        inspection?.layers.where((l) => l.name == _layer).firstOrNull?.cells ??
        const <WorkbenchCell>[];
    final failures = _failures;
    final idle = !_working;

    return Semantics(
      container: true,
      label: 'Workbench',
      child: DecoratedBox(
        decoration: BoxDecoration(
          border: Border.all(
            color: t.colors.borderSubtle,
            width: SolarBorder.$default,
          ),
          borderRadius: BorderRadius.circular(SolarRadius.control),
        ),
        child: Padding(
          padding: const EdgeInsets.all(SolarInset.sm),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisSize: MainAxisSize.min,
            spacing: SolarStack.sm,
            children: [
              Wrap(
                spacing: SolarInset.xs,
                runSpacing: SolarInset.xs,
                crossAxisAlignment: WrapCrossAlignment.center,
                children: [
                  // Announced as it changes (the circle, what the service is doing).
                  Focus(
                    focusNode: _header,
                    child: Semantics(
                      liveRegion: true,
                      child: Text(
                        '${_circle[colour] ?? ''} Workbench${status.busy == null ? '' : ' · ${status.busy}'}',
                        style: t.typography.labelSm.copyWith(
                          color: t.colors.textPrimary,
                        ),
                      ),
                    ),
                  ),
                  if (colour == 'yellow' && mine.editable)
                    _button(
                      'Inspect',
                      _toggleInspect,
                      prio: _inspecting
                          ? SolarButtonPrio.secondary
                          : SolarButtonPrio.tertiary,
                    ),
                  // One pending edit in the repository at a time: Approve and Undo approval wait
                  // for it, whichever component it is on.
                  if (colour == 'yellow')
                    _button(
                      'Approve',
                      anyPending == null && idle
                          ? () => unawaited(_approve())
                          : null,
                    ),
                  if (colour == 'green')
                    _button(
                      'Undo approval',
                      anyPending == null && idle
                          ? () => unawaited(_unapprove())
                          : null,
                    ),
                ],
              ),
              if (colour == 'red') Text(_waitsText(status, mine), style: small),
              if (colour == 'yellow' && !mine.editable && mine.locked != null)
                Text('Inspect is locked: ${mine.locked}.', style: small),
              if (anyPending != null && pending == null && colour != 'red')
                Text(
                  '${anyPending.component} has a pending edit: keep or undo it in its Playground first.',
                  style: small,
                ),
              if (colour == 'yellow' &&
                  mine.editable &&
                  _inspecting &&
                  inspection != null &&
                  anyPending == null) ...[
                Row(
                  spacing: SolarInset.xs,
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Expanded(
                      child: SolarSelect<int>(
                        size: SolarSelectSize.sm,
                        enabled: idle,
                        label: 'Variant',
                        value: _variant,
                        options: [
                          for (final v in inspection.variants)
                            SolarSelectOption(value: v.index, label: v.name),
                        ],
                        onChanged: idle
                            ? (v) {
                                setState(() {
                                  _variant = v;
                                  _scopes.clear();
                                });
                                unawaited(_inspect().catchError(_show));
                              }
                            : null,
                      ),
                    ),
                    Expanded(
                      child: SolarSelect<String>(
                        size: SolarSelectSize.sm,
                        enabled: idle,
                        label: 'Layer',
                        value: _layer,
                        options: [
                          for (final l in inspection.layers)
                            SolarSelectOption(
                              value: l.name,
                              label: l.hidden
                                  ? '${l.name} (hidden here)'
                                  : l.name,
                            ),
                        ],
                        onChanged: idle
                            ? (v) => setState(() {
                                _layer = v;
                                _scopes.clear();
                              })
                            : null,
                      ),
                    ),
                  ],
                ),
                for (final c in cells)
                  // A new variant or layer offers other scopes: the row starts again.
                  KeyedSubtree(
                    key: ValueKey('${inspection.variant}:$_layer:${c.cell}'),
                    child: _cellRow(c, inspection, small),
                  ),
              ],
              if (pending != null) ...[
                Text(
                  'Pending: ${pending.key} → ${pending.deletes ? "Figma's value (the rule is removed)" : pending.valueText}',
                  style: small,
                ),
                if (!pending.deletes)
                  SolarTextArea(
                    size: SolarTextAreaSize.sm,
                    label: 'Why (a reviewer must be able to check it)',
                    helper: pending.previousReason == null
                        ? null
                        : 'Was: ${pending.previousReason}',
                    controller: _reason,
                  ),
                if (!pending.deletes && pending.borrowers.isNotEmpty)
                  Text(
                    'Also the reason of: ${pending.borrowers.join(', ')}',
                    style: small,
                  ),
                if (pending.failing case final failing?)
                  _failureList(failing, small),
                Wrap(
                  spacing: SolarInset.xs,
                  runSpacing: SolarInset.xs,
                  children: [
                    _button(
                      'Keep',
                      idle ? _keep : null,
                      prio: SolarButtonPrio.primary,
                    ),
                    _button('Undo', idle ? _undo : null),
                  ],
                ),
              ],
              if (failures != null) _failureList(failures, small),
              if (error != null) _alert(error, t),
            ],
          ),
        ),
      ),
    );
  }

  /// One cell: its entry and the look that decides it, a scope, and the value to set it to; or, where
  /// it offers nothing, why.
  Widget _cellRow(
    WorkbenchCell c,
    WorkbenchInspection inspection,
    TextStyle small,
  ) {
    final options = [
      for (final ch in c.choices)
        SolarSelectOption(value: ch.name, label: '${ch.name} · ${ch.value}'),
      for (final k in c.keywords) SolarSelectOption(value: k, label: k),
      if (c.none) const SolarSelectOption(value: 'none', label: 'none'),
    ];
    final where = c.at == null ? '' : ' [${c.at}]';
    if (c.note != null) {
      return Text('${c.cell}: ${c.entry} (${c.note})', style: small);
    }
    if (options.isEmpty || c.scopes.isEmpty) {
      return Text(
        '${c.cell}: ${c.entry}$where (no token to choose)',
        style: small,
      );
    }
    final id = '${inspection.variant}:$_layer.${c.cell}';
    final chosen = _scopes[id];
    final scope = c.scopes.any((s) => s.key == chosen)
        ? chosen!
        : c.scopes.last.key;
    final idle = !_working;
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      spacing: SolarStack.sm,
      children: [
        Text('${c.cell}: ${c.entry}$where', style: small),
        Row(
          spacing: SolarInset.xs,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Expanded(
              child: SolarSelect<String>(
                size: SolarSelectSize.sm,
                enabled: idle,
                label: 'Scope',
                value: scope,
                options: [
                  for (final s in c.scopes)
                    SolarSelectOption(value: s.key, label: s.label),
                ],
                onChanged: idle ? (v) => setState(() => _scopes[id] = v) : null,
              ),
            ),
            Expanded(
              child: SolarSelect<String>(
                size: SolarSelectSize.sm,
                enabled: idle,
                label: 'Set to',
                placeholder: 'Choose',
                options: options,
                onChanged: idle
                    ? (v) => unawaited(
                        _act(() async {
                          await widget.client.set(
                            component: widget.component,
                            variant: inspection.variant,
                            layer: _layer,
                            cell: c.cell,
                            scope: scope,
                            value: _valueOf(v),
                            revision: inspection.revision,
                          );
                        }),
                      )
                    : null,
              ),
            ),
          ],
        ),
      ],
    );
  }
}
