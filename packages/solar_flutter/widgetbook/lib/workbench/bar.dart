// The workbench bar above a component's Playground: its circle on this platform, and by it Inspect,
// Report and Approve (🟡), Undo approval (🟢), or what it waits on (🔴). Inspect opens the Inspect
// dialog (inspect_dialog.dart), a full-screen route; Report opens a note under the bar. One of the
// two is open at a time; Report's note is its own, so it may be saved beside a pending edit. Where
// checks fail (a Keep's or an Approve's) and the component may change, Send to agent writes a note
// carrying them.
// Everything it changes goes through the workbench service (client.dart); it draws nothing where no
// service answers. Drawn with SOLAR's own widgets. It behaves as the web's bar
// (stories/workbench/Bar.tsx) does, which the scenarios in
// packages/codegen/src/workbench/bar-scenarios.json, run by both bars' tests, enforce.
//
// A refusal is shown once, as the action's own answer: the service also tells every viewer it
// failed (a `failed` event), on which the bar only refetches.

import 'dart:async';

import 'package:flutter/material.dart';
import 'package:solar_flutter/solar_flutter.dart';

import 'blocks.dart';
import 'client.dart';
import 'inspect_dialog.dart';
import 'models.dart';

const _circle = {'green': '🟢', 'yellow': '🟡', 'red': '🔴'};

/// What is open: nothing, the Inspect dialog, or Report's note below the bar's buttons.
enum _Section { none, inspect, report }

/// How long the bar waits before asking a service that is still starting, or whose poll failed.
const _retry = Duration(seconds: 1);

class WorkbenchBar extends StatefulWidget {
  const WorkbenchBar({
    super.key,
    required this.component,
    required this.platform,
    required this.client,
    this.controls = const {},
    this.oracle,
  });

  /// The component's name, as the service and the oracles name it (`Button`, `ConfirmationDialog`).
  final String component;

  /// `flutter` in Widgetbook: the platform the bar approves on.
  final String platform;
  final WorkbenchClient client;

  /// The Playground's values, by control, as JSON-safe values: what a Report note records.
  final Map<String, Object?> controls;

  /// The component's oracle (spec/verify/), which the Inspect dialog draws the variant in view
  /// from, as the Variants use case does; null draws no preview.
  final Map<String, dynamic>? oracle;

  /// The key of the error the bar shows (a refusal, or a service that failed), and the Inspect
  /// dialog while it is open, for the tests to find it by.
  static const errorKey = Key('WorkbenchBar.error');

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

  /// The cell chosen in the dialog, whose editor it shows, and the scope chosen for it: null, the
  /// narrowest. The cell is forgotten when the layer changes or the dialog closes; the scope also
  /// when the variant or the cell changes, or a pending edit comes or goes.
  String? _cell;
  String? _scope;
  _Section _section = _Section.none;
  bool get _inspecting => _section == _Section.inspect;

  /// The Inspect dialog's route, while it is open.
  ModalRoute<void>? _dialog;

  /// Told of every change to the bar's state: the dialog is a route of its own, rebuilt on it.
  final _changes = ValueNotifier(0);

  /// Whether an action is running: every button and Select that starts another waits for it.
  bool _working = false;
  String? _error;
  List<WorkbenchFailure>? _failures;
  final _reason = TextEditingController();
  final _note = TextEditingController();

  /// Send to agent's note, its own: Report's may be open beside it.
  final _agentNote = TextEditingController();

  /// Filter tokens' text in the dialog's editor.
  final _filter = TextEditingController();

  /// The file the last note was saved in, until the next action or Report closes.
  String? _saved;

  /// The file the last Send to agent wrote, and whether it kept a failing Keep's edit, until the
  /// next action.
  ({String file, bool fromKeep})? _sent;

  /// The header, which the focus goes to after Approve or Undo approval: focusable, though not in
  /// the traversal order (the web's `tabIndex={-1}`).
  final _header = FocusNode(
    debugLabel: 'Workbench header',
    skipTraversal: true,
  );

  /// Inspect, which the focus goes back to when the dialog closes.
  final _inspectButton = FocusNode(debugLabel: 'Inspect');

  int _seq = 0;

  @override
  void initState() {
    super.initState();
    unawaited(_start());
  }

  /// Every change also reaches the dialog; and the dialog goes where Inspect has closed.
  @override
  void setState(VoidCallback fn) {
    super.setState(fn);
    _changes.value++;
    if (!_inspecting && _dialog != null) _removeDialog();
  }

  @override
  void dispose() {
    _live = false;
    final dialog = _dialog;
    _dialog = null;
    void release() {
      _reason.dispose();
      _note.dispose();
      _agentNote.dispose();
      _filter.dispose();
      _changes.dispose();
    }

    // The dialog draws from what the bar holds: it goes first, after this frame.
    if (dialog != null && dialog.isActive) {
      WidgetsBinding.instance.addPostFrameCallback((_) {
        if (dialog.isActive) dialog.navigator?.removeRoute(dialog);
        release();
      });
    } else {
      release();
    }
    _header.dispose();
    _inspectButton.dispose();
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

  /// Whether the component may be inspected, and reported on, in [status]: 🟡 here, and locked
  /// nowhere.
  bool _canInspect(WorkbenchStatus status) {
    final mine = status.components[widget.component];
    return mine?.colourOn(widget.platform) == 'yellow' && mine!.editable;
  }

  /// The status, in a setState: where the component was locked or approved meanwhile, Inspect or
  /// Report closes, and opens again only when asked.
  void _setStatus(WorkbenchStatus status) {
    // A pending edit coming or going: Apply to starts again at the narrowest.
    if ((status.pending == null) != (_status?.pending == null)) _scope = null;
    _status = status;
    if (_section != _Section.none && !_canInspect(status)) {
      _section = _Section.none;
    }
  }

  /// The dialog, gone: Close or Escape popped it, or the bar removed it. Its cell and scope go
  /// with it; the layer and variant stay, for a note saved after it.
  void _dialogGone() {
    _cell = null;
    _scope = null;
    if (_inspecting) _section = _Section.none;
  }

  /// Takes the dialog away (Report pressed in it, the component no longer inspectable), after the
  /// state change that closed Inspect.
  void _removeDialog() {
    final dialog = _dialog;
    _dialog = null;
    _cell = null;
    _scope = null;
    if (dialog != null && dialog.isActive) {
      dialog.navigator?.removeRoute(dialog);
    }
  }

  /// Opens the dialog, over the page, once the inspection is read; a refused read opens none, and
  /// is shown in the bar.
  Future<void> _openInspect() async {
    setState(() {
      _section = _Section.inspect;
      _saved = null;
    });
    try {
      await _inspect();
    } catch (e) {
      if (mounted && _inspecting) {
        setState(() {
          _section = _Section.none;
          _error = '$e';
        });
      }
      return;
    }
    if (!mounted || !_inspecting || _inspection == null || _dialog != null) {
      return;
    }
    final route = inspectDialogRoute(
      context: context,
      builder: (context) => ListenableBuilder(
        listenable: _changes,
        builder: (context, _) =>
            _dialog == null ? const SizedBox.shrink() : _dialogView(),
      ),
    );
    _dialog = route;
    unawaited(
      inspectNavigator(context).push(route).then((_) {
        // Popped by Close or Escape; one the bar removed is already forgotten.
        if (!mounted || _dialog != route) return;
        _dialog = null;
        setState(_dialogGone);
        // Back where it was opened from, once the page takes input again.
        WidgetsBinding.instance.addPostFrameCallback((_) {
          if (mounted && _inspectButton.context != null) {
            _inspectButton.requestFocus();
          }
        });
      }),
    );
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

  /// The inspection of the variant in view, while Inspect is open; an answer for another variant
  /// (one chosen since) is dropped.
  /// A variant that does not draw the layer in view selects the root (and the cell goes); where
  /// [refilter], Filter tokens starts again at the chosen cell's family in it.
  Future<void> _inspect({bool refilter = false}) async {
    final variant = _variant;
    final inspection = await widget.client.inspect(widget.component, variant);
    if (mounted && _inspecting && inspection.variant == _variant) {
      setState(() {
        _inspection = inspection;
        if (!inspection.layers.any((l) => l.name == _layer)) {
          _layer = _rootOf(inspection);
          _cell = null;
          _scope = null;
        }
        if (refilter) _refilter();
      });
    }
  }

  /// The inspection's root layer: the one in no other.
  String _rootOf(WorkbenchInspection inspection) =>
      (inspection.layers.where((l) => l.parent == null).firstOrNull ??
              inspection.layers.first)
          .name;

  /// Filter tokens, back at the chosen cell's family (vocabulary.dialog."Filter tokens").
  void _refilter() {
    final cell = _inspection?.layers
        .where((l) => l.name == _layer)
        .firstOrNull
        ?.cells
        .where((c) => c.cell == _cell)
        .firstOrNull;
    _filter.text = cell == null ? '' : startFilter(cell);
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
      _saved = null;
      _sent = null;
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

  /// A set value as Change to writes it: a token's name, `FILL`, `HUG` or `none`.
  Map<String, Object?> _valueOf(String choice) => choice == 'none'
      ? {'none': true}
      : choice == 'FILL' || choice == 'HUG'
      ? {'keyword': choice}
      : {'token': choice};

  Widget _button(
    String label,
    VoidCallback? onPressed, {
    SolarButtonPrio prio = SolarButtonPrio.tertiary,
    FocusNode? focusNode,
  }) => workbenchButton(label, onPressed, prio: prio, focusNode: focusNode);

  /// Report: opens its note, or closes it where it is open. From the dialog, the dialog closes and
  /// the note opens with the layer and variant it had in view.
  void _toggleReport() => setState(() {
    _section = _section == _Section.report ? _Section.none : _Section.report;
    _saved = null;
  });

  /// Change to in the dialog: the value set at [scope] on the cell chosen, in the variant in view.
  void _change(String choice, String scope) {
    final inspection = _inspection;
    final cell = _cell;
    if (inspection == null || cell == null) return;
    unawaited(
      _act(() async {
        await widget.client.set(
          component: widget.component,
          variant: inspection.variant,
          layer: _layerIn(inspection),
          cell: cell,
          scope: scope,
          value: _valueOf(choice),
          revision: inspection.revision,
        );
        if (mounted) _refilter();
      }),
    );
  }

  /// The layer chosen, where [inspection] has it; else its root.
  String _layerIn(WorkbenchInspection inspection) =>
      inspection.layers.any((l) => l.name == _layer)
      ? _layer
      : _rootOf(inspection);

  /// Save note: the note with the Playground's values and, where this component has been
  /// inspected, the layer and variant chosen there; then the file it was saved in, and an empty
  /// note.
  void _saveNote() {
    final inspected = _inspection?.component == widget.component
        ? _inspection
        : null;
    unawaited(
      _act(() async {
        final file = await widget.client.report(
          component: widget.component,
          platform: widget.platform,
          controls: widget.controls,
          layer: inspected == null ? null : _layerIn(inspected),
          variant: inspected?.variants
              .where((v) => v.index == inspected.variant)
              .firstOrNull
              ?.name,
          note: _note.text,
        );
        _note.clear();
        if (mounted) setState(() => _saved = file);
      }),
    );
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

  /// Send to agent: the failing checks shown, a Keep's (whose edit is then no longer pending) or an
  /// Approve's, with the note, even none. Refused, the checks stay shown, to send again.
  void _sendToAgent(List<WorkbenchFailure> shown, {required bool fromKeep}) =>
      unawaited(
        _act(() async {
          try {
            final file = await widget.client.send(
              component: widget.component,
              platform: widget.platform,
              note: _agentNote.text,
              failures: shown,
            );
            _agentNote.clear();
            _reason.clear();
            if (mounted) {
              setState(() => _sent = (file: file, fromKeep: fromKeep));
            }
          } catch (_) {
            if (!fromKeep && mounted) setState(() => _failures = shown);
            rethrow;
          }
        }),
      );

  /// This component's pending edit, as the bar and the dialog's strip draw it ([wide]).
  Widget _pendingBlock(
    WorkbenchPending pending, {
    bool wide = false,
    String? title,
  }) {
    final idle = !_working;
    return WorkbenchPendingBlock(
      pending: pending,
      reason: _reason,
      agentNote: _agentNote,
      canSend: _status != null && _canInspect(_status!),
      onKeep: idle ? _keep : null,
      onUndo: idle ? _undo : null,
      onSend: idle && pending.failing != null
          ? () => _sendToAgent(pending.failing!, fromKeep: true)
          : null,
      wide: wide,
      title: title,
    );
  }

  /// What Send to agent saved, and what it did to a failing Keep's edit.
  Widget _sentText(
    ({String file, bool fromKeep}) sent,
    TextStyle small,
  ) => Semantics(
    liveRegion: true,
    child: Text(
      'Saved: ${sent.file}${sent.fromKeep ? '. The edit is kept; $sentKeepsNote' : ''}',
      style: small,
    ),
  );

  /// The Inspect dialog as the bar's state has it now.
  Widget _dialogView() {
    final status = _status!;
    final inspection = _inspection!;
    final anyPending = status.pending;
    final pending = anyPending?.component == widget.component
        ? anyPending
        : null;
    final layer = _layerIn(inspection);
    final t = SolarTheme.of(context);
    return InspectDialog(
      component: widget.component,
      inspection: inspection,
      oracle: widget.oracle,
      layer: layer,
      cell: _cell,
      scope: _scope,
      editable: anyPending == null && !_working,
      busy: status.busy,
      readOnly: anyPending == null
          ? null
          : pending != null
          ? 'One edit at a time: Keep or Undo the pending edit below first.'
          : "One edit at a time: Keep or Undo the pending edit in ${anyPending.component}'s Playground first.",
      regenerating: _working || status.busy != null,
      filter: _filter,
      onFilter: () => setState(() {}),
      strip: pending == null
          ? null
          : _pendingBlock(
              pending,
              wide: true,
              title: pendingText(inspection, pending),
            ),
      foot: [if (_sent case final sent?) _sentText(sent, workbenchSmall(t))],
      error: _error,
      errorKey: WorkbenchBar.errorKey,
      onAxis: (index) {
        setState(() {
          _variant = index;
          _scope = null;
          _refilter();
        });
        unawaited(_inspect(refilter: true).catchError(_show));
      },
      onLayer: (name) => setState(() {
        if (name != _layer) {
          _cell = null;
          _scope = null;
        }
        _layer = name;
      }),
      onCell: (name) => setState(() {
        if (name != _cell) {
          _scope = null;
          _cell = name;
          _refilter();
        }
      }),
      onScope: (key) => setState(() => _scope = key),
      onChange: _change,
      onReport: _toggleReport,
      onClose: () {
        final dialog = _dialog;
        if (dialog != null && dialog.isCurrent) {
          dialog.navigator?.pop();
        }
      },
    );
  }

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

  Widget _alert(String text) =>
      WorkbenchAlert(text, textKey: WorkbenchBar.errorKey);

  @override
  Widget build(BuildContext context) {
    final t = Theme.of(context).extension<SolarTheme>()!;
    final error = _error;
    if (!_alive) {
      return error == null ? const SizedBox.shrink() : _alert(error);
    }
    final status = _status;
    final mine = status?.components[widget.component];
    if (status == null || mine == null) return const SizedBox.shrink();
    final small = workbenchSmall(t);
    final colour = mine.colourOn(widget.platform);
    final anyPending = status.pending;
    final pending = anyPending?.component == widget.component
        ? anyPending
        : null;
    final failures = _failures;
    final idle = !_working;
    final canInspect = colour == 'yellow' && mine.editable;
    // While the dialog is open it holds the pending edit, its failures and the error, and the bar
    // behind it none: one reason field, one agent note.
    final open = _dialog != null;

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
                  if (canInspect)
                    _button(
                      'Inspect',
                      () => unawaited(_openInspect()),
                      focusNode: _inspectButton,
                    ),
                  if (canInspect)
                    _button(
                      'Report',
                      _toggleReport,
                      prio: _section == _Section.report
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
                Text(
                  'Inspect and Report are locked: ${mine.locked}.',
                  style: small,
                ),
              if (anyPending != null && pending == null && colour != 'red')
                Text(
                  '${anyPending.component} has a pending edit: keep or undo it in its Playground first.',
                  style: small,
                ),
              if (canInspect && _section == _Section.report) ...[
                SolarTextArea(
                  size: SolarTextAreaSize.sm,
                  label: 'Note for the agent',
                  helper: "What Inspect cannot change: a behaviour, a raw value, a layout. The Playground's values go with it.",
                  controller: _note,
                  onChanged: (_) => setState(() {}),
                ),
                _button(
                  'Save note',
                  idle && _note.text.trim().isNotEmpty ? _saveNote : null,
                  prio: SolarButtonPrio.primary,
                ),
                if (_saved case final file?)
                  Semantics(
                    liveRegion: true,
                    child: Text('Saved: $file', style: small),
                  ),
              ],
              if (pending != null && !open) _pendingBlock(pending),
              if (failures != null && !open) ...[
                WorkbenchFailureList(failures),
                if (canInspect)
                  WorkbenchSendBlock(
                    note: _agentNote,
                    fromKeep: false,
                    onSend: idle
                        ? () => _sendToAgent(failures, fromKeep: false)
                        : null,
                  ),
              ],
              if (_sent case final sent? when !open) _sentText(sent, small),
              if (error != null && !open) _alert(error),
            ],
          ),
        ),
      ),
    );
  }
}
