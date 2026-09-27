/// The Widgetbook adapter for a Playground builder: the component's controls (playgroundControls,
/// generated, its extras included) as knobs, synced both ways through the knobs' URL query group,
/// and around the component a Reset button, the width box and the event log, and above them the
/// workbench bar where scripts/widgetbook.mjs serves with the workbench (../workbench/). The only code here
/// that knows Widgetbook; everything viewer-free is core.dart, and a builder sees the
/// SolarPlayground interface alone (playground.dart). It mirrors the Storybook adapter,
/// packages/components/stories/playground/adapter.tsx.
library;

import 'package:flutter/material.dart';
import 'package:solar_flutter/solar_flutter.dart';
import 'package:widgetbook/widgetbook.dart';

import '../workbench/bar.dart';
import '../workbench/client.dart';
import 'core.dart';
import 'playground.dart';

/// The query group Widgetbook keeps every knob's value in.
const _knobsGroup = 'knobs';

/// A control's knob, and its value in the knob's query text.
extension PlaygroundKnob on PlaygroundControl {
  /// Whether a number or integer control is drawn as a slider: where it has both bounds, which a
  /// Widgetbook slider needs; an input otherwise, which takes no bounds (`whole` clamps).
  bool get _slider => min != null && max != null;

  int? get _divisions =>
      step == null || step! <= 0 ? null : ((max! - min!) / step!).round();

  /// The bounds and step, for the knob's description, where Widgetbook draws them nowhere else.
  String? get _bounds {
    if (min == null && max == null && step == null) return null;
    return [
      if (min != null) 'min $min',
      if (max != null) 'max $max',
      if (step != null) 'step $step',
    ].join(', ');
  }

  /// Registers the knob on the use case being built and returns its current value.
  Object? knob(BuildContext context) => switch (kind) {
    'boolean' || 'child' || 'content' => context.knobs.boolean(
      label: name,
      initialValue: initial! as bool,
    ),
    'text' || 'childText' => context.knobs.string(
      label: name,
      initialValue: (initial as String?) ?? '',
    ),
    'number' when _slider => context.knobs.double.slider(
      label: name,
      initialValue: (initial! as num).toDouble(),
      min: min!.toDouble(),
      max: max!.toDouble(),
      divisions: _divisions,
      precision: null,
    ),
    'number' => context.knobs.double.input(
      label: name,
      description: _bounds,
      initialValue: (initial as num?)?.toDouble() ?? 0,
    ),
    'integer' when _slider => context.knobs.int.slider(
      label: name,
      initialValue: initial! as int,
      min: min!.toInt(),
      max: max!.toInt(),
      divisions: _divisions,
    ),
    'integer' => context.knobs.int.input(
      label: name,
      description: _bounds,
      initialValue: (initial as int?) ?? 0,
    ),
    'color' => context.knobs.colorOrNull(
      label: name,
      initialValue: colorOf(initial),
    ),
    'select' || 'icon' || 'width' => context.knobs.object.dropdown<String>(
      label: name,
      options: choices,
      initialOption: initial as String?,
    ),
    _ => throw StateError('$name: no knob for a control of kind "$kind"'),
  };

  /// [value] as the knob's query text: what its Widgetbook field's codec writes when a tester
  /// changes the knob, so the knob reads it back as [value]. A colour control's null is written the
  /// way a nullable knob's cleared box is (`??` before a value); a text control's null is empty.
  String encode(Object? value) {
    switch (kind) {
      case 'boolean' || 'child' || 'content':
        return BooleanField(name: name).codec.toParam(_require<bool>(value));
      case 'text' || 'childText':
        return StringField(name: name).codec.toParam((value as String?) ?? '');
      case 'number':
        final n = _require<num>(value).toDouble();
        return _slider
            ? DoubleSliderField(
                name: name,
                initialValue: min!.toDouble(),
                min: min!.toDouble(),
                max: max!.toDouble(),
                precision: null,
              ).codec.toParam(n)
            : DoubleInputField(name: name).codec.toParam(n);
      case 'integer':
        final n = _require<int>(value);
        return _slider
            ? IntSliderField(
                name: name,
                initialValue: min!.toInt(),
                min: min!.toInt(),
                max: max!.toInt(),
              ).codec.toParam(n)
            : IntInputField(name: name).codec.toParam(n);
      case 'color':
        final field = ColorField(name: name);
        final color = colorOf(value);
        return color == null
            ? '${Field.nullabilitySymbol}${field.defaultValueStringified}'
            : field.codec.toParam(color);
      case 'select' || 'icon' || 'width':
        final option = _require<String>(value);
        if (!choices.contains(option)) {
          throw ArgumentError.value(value, name, 'not one of its options');
        }
        return ObjectDropdownField<String>(
          name: name,
          values: choices,
          initialValue: initial as String?,
        ).codec.toParam(option);
    }
    throw StateError('$name: no knob for a control of kind "$kind"');
  }

  T _require<T>(Object? value) => value is T
      ? value
      : throw ArgumentError.value(value, name, 'a $kind control takes a $T');
}

/// Each component's Playground view, by component. Widgetbook builds a use case afresh whenever its
/// URL changes (its UseCaseBuilder is keyed by it), which every knob change does; a global key moves
/// the view into the new tree instead, keeping the event log and the component's own state (a
/// field's focus and cursor while a tester types). Leaving the use case drops it: coming back starts
/// with an empty log, as a Storybook story does. One key per component: two Playgrounds of one
/// component on screen at once (Widgetbook shows one use case at a time) would collide.
final _views = <String, GlobalKey>{};

/// The Playground use case for [component]: registers a knob per control on [context] (the use
/// case's), then draws the workbench bar (served with the workbench alone), Reset, the builder's
/// component in the width box, and the event log.
Widget solarPlayground(
  BuildContext context,
  String component,
  SolarPlaygroundBuilder builder,
) {
  final controls = controlsOf(component);
  return _PlaygroundView(
    key: _views.putIfAbsent(component, GlobalKey.new),
    component: component,
    builder: builder,
    controls: controls,
    values: {for (final c in controls) c.name: c.knob(context)},
    state: WidgetbookState.of(context),
  );
}

class _PlaygroundView extends StatefulWidget {
  const _PlaygroundView({
    super.key,
    required this.component,
    required this.builder,
    required this.controls,
    required this.values,
    required this.state,
  });

  final String component;
  final SolarPlaygroundBuilder builder;
  final List<PlaygroundControl> controls;
  final Map<String, Object?> values;
  final WidgetbookState state;

  @override
  State<_PlaygroundView> createState() => _PlaygroundViewState();
}

class _PlaygroundViewState extends State<_PlaygroundView> {
  List<String> _log = const [];

  /// The workbench service's client, where scripts/widgetbook.mjs serves with one: made when the
  /// bar is first drawn, closed with the view.
  HttpWorkbenchClient? _workbenchClient;
  HttpWorkbenchClient get _workbench =>
      _workbenchClient ??= HttpWorkbenchClient(workbenchUrl);

  @override
  void dispose() {
    _workbenchClient?.close();
    super.dispose();
  }

  /// The builder's Playground: one for the view's life, reading the knobs' values as the latest
  /// build has them, so a builder's state may keep it.
  late final _p = ControlledPlayground(
    controls: widget.controls,
    read: (name) => widget.values[name],
    write: (control, value) {
      if (mounted) _write(control, value);
    },
    onLog: (event, detail) {
      if (!mounted) return;
      setState(() => _log = withLine(_log, logLine(event, detail)));
    },
  );

  /// Writes [value] into the knobs' query group, as the knob's own field would: the use case is
  /// rebuilt with the knob reading it, and the panel shows it.
  void _write(PlaygroundControl control, Object? value) =>
      widget.state.updateQueryField(
        group: _knobsGroup,
        field: control.name,
        value: control.encode(value),
      );

  /// Every control back at its default, writing only those that differ (each write is a URL
  /// change); and an empty log.
  void _reset() {
    for (final c in widget.controls) {
      if (c.encode(widget.values[c.name]) != c.encode(c.initial)) {
        _write(c, c.initial);
      }
    }
    setState(() => _log = const []);
  }

  @override
  Widget build(BuildContext context) {
    final t = Theme.of(context).extension<SolarTheme>()!;
    final width = double.tryParse('${widget.values['width']}');
    final small = t.typography.bodyXsRegular.copyWith(
      color: t.colors.textSecondary,
    );
    return SingleChildScrollView(
      padding: const EdgeInsets.all(SolarInset.md),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        spacing: SolarStack.md,
        children: [
          // Never in a build or a test: the URL is given only by `npm run widgetbook`.
          if (workbenchUrl.isNotEmpty)
            WorkbenchBar(
              component: widget.component,
              platform: 'flutter',
              client: _workbench,
            ),
          SolarButton(
            prio: SolarButtonPrio.tertiary,
            size: SolarButtonSize.sm,
            onPressed: _reset,
            child: const Text('Reset'),
          ),
          // The width box: at `auto` as wide as the column, otherwise the width picked; the
          // component at its start under loose constraints, so a filling one (a ProgressBar, an
          // Alert) takes the box's width and a hugging one (a Button) keeps its own. As the web's
          // (stories/playground/core.tsx `WidthBox`).
          SizedBox(
            width: width ?? double.infinity,
            child: Align(
              alignment: AlignmentDirectional.topStart,
              child: widget.builder.build(_p),
            ),
          ),
          Semantics(
            container: true,
            label: 'Event log',
            child: Padding(
              padding: const EdgeInsets.only(left: SolarInset.md),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  for (final (i, l) in _log.indexed)
                    Text('${i + 1}. $l', style: small),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}
