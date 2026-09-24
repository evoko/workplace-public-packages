import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

import 'solar_states.dart';

/// Wraps one handle of a slider in its focus, keyboard and semantics: given the handle as drawn.
typedef SolarSliderHandle = Widget Function(int index, Widget handle);

/// The input of a slider SOLAR draws itself (SolarSlider, SolarSliderRange), where Flutter's
/// Slider paints a track and thumb of its own: a pointer drags the nearest handle along the
/// track or puts it where it taps, each handle takes the focus and the arrow keys, and each is
/// announced as a slider. The whole takes the states Figma draws: hovered, pressed while a handle
/// is held, focused while one has the keyboard.
///
/// Hand written, like [SolarPressable]. Values are fractions of the track, 0 to 1, in order; the
/// shell maps them to its own range. It draws nothing: [builder] draws the slider in its states,
/// at the width it is given, wrapping each handle with the function it is handed.
class SolarSliderInput extends StatefulWidget {
  /// The input over the slider [builder] draws.
  const SolarSliderInput({
    super.key,
    required this.values,
    required this.onChanged,
    required this.labels,
    required this.valueLabel,
    required this.builder,
    this.onChangeStart,
    this.onChangeEnd,
    this.step = 0.1,
    this.statesController,
  });

  /// Where each handle is, as a fraction of the track, in order.
  final List<double> values;

  /// Called with every handle's fraction when one moves; null disables the slider.
  final ValueChanged<List<double>>? onChanged;

  /// Called when a pointer takes a handle.
  final ValueChanged<List<double>>? onChangeStart;

  /// Called when the pointer lets the handle go.
  final ValueChanged<List<double>>? onChangeEnd;

  /// What each handle sets, for a screen reader.
  final List<String?> labels;

  /// A handle's value as a screen reader says it.
  final String Function(double fraction) valueLabel;

  /// How far an arrow key moves a handle, as a fraction of the track.
  final double step;

  /// Its states, where the caller keeps them (the visual checks force a state through it).
  final WidgetStatesController? statesController;

  /// The slider in its states, [width] wide, each handle wrapped by [handle].
  final Widget Function(
    BuildContext context,
    Set<WidgetState> states,
    double width,
    SolarSliderHandle handle,
  )
  builder;

  @override
  State<SolarSliderInput> createState() => _SolarSliderInputState();
}

class _Step extends Intent {
  const _Step(this.by);

  final int by;
}

class _SolarSliderInputState extends State<SolarSliderInput> {
  late List<FocusNode> _focus;
  final _focused = <int>{};
  int? _held;
  double _width = 0;

  bool get _enabled => widget.onChanged != null;

  @override
  void initState() {
    super.initState();
    _focus = [for (final _ in widget.values) FocusNode()];
  }

  @override
  void didUpdateWidget(SolarSliderInput old) {
    super.didUpdateWidget(old);
    if (old.values.length != widget.values.length) {
      for (final f in _focus) {
        f.dispose();
      }
      _focus = [for (final _ in widget.values) FocusNode()];
    }
  }

  @override
  void dispose() {
    for (final f in _focus) {
      f.dispose();
    }
    super.dispose();
  }

  /// [index] moved to [to], kept between its neighbours.
  List<double> _moved(int index, double to) {
    final lo = index == 0 ? 0.0 : widget.values[index - 1];
    final hi = index == widget.values.length - 1
        ? 1.0
        : widget.values[index + 1];
    return [...widget.values]..[index] = to.clamp(lo, hi);
  }

  int _nearest(double at) {
    var best = 0;
    for (var i = 1; i < widget.values.length; i++) {
      if ((widget.values[i] - at).abs() <= (widget.values[best] - at).abs()) {
        best = i;
      }
    }
    return best;
  }

  double _at(Offset local) =>
      _width == 0 ? 0 : (local.dx / _width).clamp(0.0, 1.0);

  void _take(Offset local, WidgetStatesController states) {
    final at = _at(local);
    _held = _nearest(at);
    states.update(WidgetState.pressed, true);
    widget.onChangeStart?.call(widget.values);
    widget.onChanged!(_moved(_held!, at));
  }

  void _drag(Offset local) {
    if (_held != null) widget.onChanged!(_moved(_held!, _at(local)));
  }

  void _let(WidgetStatesController states) {
    if (_held == null) return;
    _held = null;
    states.update(WidgetState.pressed, false);
    widget.onChangeEnd?.call(widget.values);
  }

  Widget _handle(int index, Widget drawn, WidgetStatesController states) {
    final v = widget.values[index];
    void by(int n) => widget.onChanged!(_moved(index, v + n * widget.step));
    return Semantics(
      slider: true,
      label: widget.labels[index],
      value: widget.valueLabel(v),
      increasedValue: widget.valueLabel(_moved(index, v + widget.step)[index]),
      decreasedValue: widget.valueLabel(_moved(index, v - widget.step)[index]),
      enabled: _enabled,
      onIncrease: _enabled ? () => by(1) : null,
      onDecrease: _enabled ? () => by(-1) : null,
      child: FocusableActionDetector(
        enabled: _enabled,
        focusNode: _focus[index],
        onShowFocusHighlight: (on) {
          on ? _focused.add(index) : _focused.remove(index);
          states.update(WidgetState.focused, _focused.isNotEmpty);
        },
        shortcuts: const {
          SingleActivator(LogicalKeyboardKey.arrowRight): _Step(1),
          SingleActivator(LogicalKeyboardKey.arrowUp): _Step(1),
          SingleActivator(LogicalKeyboardKey.arrowLeft): _Step(-1),
          SingleActivator(LogicalKeyboardKey.arrowDown): _Step(-1),
        },
        actions: {
          _Step: CallbackAction<_Step>(
            onInvoke: (step) {
              by(step.by);
              return null;
            },
          ),
        },
        child: drawn,
      ),
    );
  }

  @override
  Widget build(BuildContext context) => SolarStatesScope(
    controller: widget.statesController,
    builder: (context, states) => LayoutBuilder(
      builder: (context, constraints) {
        _width = constraints.maxWidth;
        return MouseRegion(
          cursor: _enabled ? SystemMouseCursors.click : MouseCursor.defer,
          onEnter: _enabled
              ? (_) => states.update(WidgetState.hovered, true)
              : null,
          onExit: (_) => states.update(WidgetState.hovered, false),
          child: GestureDetector(
            behavior: HitTestBehavior.opaque,
            onTapDown: _enabled ? (d) => _take(d.localPosition, states) : null,
            onTapUp: _enabled ? (_) => _let(states) : null,
            onTapCancel: _enabled ? () => _let(states) : null,
            // A press held before the drag began has taken its handle already.
            onHorizontalDragStart: _enabled
                ? (d) {
                    if (_held == null) _take(d.localPosition, states);
                  }
                : null,
            onHorizontalDragUpdate: _enabled
                ? (d) => _drag(d.localPosition)
                : null,
            onHorizontalDragEnd: _enabled ? (_) => _let(states) : null,
            onHorizontalDragCancel: _enabled ? () => _let(states) : null,
            child: ListenableBuilder(
              listenable: states,
              builder: (context, _) => widget.builder(
                context,
                {...states.value},
                _width,
                (index, drawn) => _handle(index, drawn, states),
              ),
            ),
          ),
        );
      },
    ),
  );
}
