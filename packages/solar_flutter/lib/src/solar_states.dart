import 'package:flutter/material.dart';

/// A control's states, shared with what it holds: SOLAR draws a Counter inside a Button in the
/// Button's hover, pressed and disabled colours, so the Counter reads the states of the control
/// around it, through a [SolarStatesBuilder].
///
/// Hand written, like [SolarPressable]. The control drives the [WidgetStatesController] the
/// builder is given (a FilledButton's `statesController`): the caller's [controller], or, where it
/// gives none, one of the scope's own.
class SolarStatesScope extends StatefulWidget {
  /// Shares the states of the control [builder] builds.
  const SolarStatesScope({super.key, this.controller, required this.builder});

  /// The control's states controller, where the caller keeps one.
  final WidgetStatesController? controller;

  /// Builds the control around the controller it should drive.
  final Widget Function(BuildContext context, WidgetStatesController states)
  builder;

  /// The states controller of the nearest control around [context], or null.
  static WidgetStatesController? maybeOf(BuildContext context) =>
      context.dependOnInheritedWidgetOfExactType<_SolarStates>()?.states;

  @override
  State<SolarStatesScope> createState() => _SolarStatesScopeState();
}

class _SolarStatesScopeState extends State<SolarStatesScope> {
  WidgetStatesController? _own;

  WidgetStatesController get _states =>
      widget.controller ?? (_own ??= WidgetStatesController());

  @override
  void didUpdateWidget(SolarStatesScope old) {
    super.didUpdateWidget(old);
    if (widget.controller != null && _own != null) {
      _own!.dispose();
      _own = null;
    }
  }

  @override
  void dispose() {
    _own?.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) => _SolarStates(
    states: _states,
    child: Builder(builder: (context) => widget.builder(context, _states)),
  );
}

// The controller alone, not a notifier: a control updates its states while it builds (a
// FilledButton marks itself disabled), which the scope above it may not rebuild for. What reads
// them sits below the control, and listens itself (SolarStatesBuilder).
class _SolarStates extends InheritedWidget {
  const _SolarStates({required this.states, required super.child});

  final WidgetStatesController states;

  @override
  bool updateShouldNotify(_SolarStates old) => states != old.states;
}

/// Builds a widget in the states of the control around it (a Counter in a Button), rebuilding when
/// they change; in none where there is no such control.
class SolarStatesBuilder extends StatelessWidget {
  /// Builds [builder] in the states of the nearest [SolarStatesScope].
  const SolarStatesBuilder({super.key, required this.builder});

  /// The widget in these states.
  final Widget Function(BuildContext context, Set<WidgetState> states) builder;

  @override
  Widget build(BuildContext context) {
    final states = SolarStatesScope.maybeOf(context);
    if (states == null) return builder(context, const <WidgetState>{});
    return ListenableBuilder(
      listenable: states,
      builder: (context, _) => builder(context, {...states.value}),
    );
  }
}

/// Hover, press and focus for a widget SOLAR draws itself (an interactive Counter), where no stock
/// control supplies them: tracked in [statesController] (the scope's own where none is given),
/// shared through a [SolarStatesScope], and a tap or the keyboard's activation calls [onPressed].
/// It is disabled, and announced so, where [onPressed] is null.
class SolarPressable extends StatelessWidget {
  /// A pressable region drawn by [builder] in its current states.
  const SolarPressable({
    super.key,
    required this.onPressed,
    required this.builder,
    this.statesController,
    this.link = false,
  });

  /// Called on a tap or the keyboard's activation; null disables it.
  final VoidCallback? onPressed;

  /// The widget in these states.
  final Widget Function(BuildContext context, Set<WidgetState> states) builder;

  /// The states, where the caller keeps them (the visual checks force a state through it).
  final WidgetStatesController? statesController;

  /// Whether it is announced as a link (Link) rather than a button.
  final bool link;

  @override
  Widget build(BuildContext context) => SolarStatesScope(
    controller: statesController,
    builder: (context, states) {
      final enabled = onPressed != null;
      void set(WidgetState state, bool on) => states.update(state, on);
      return Semantics(
        button: !link,
        link: link,
        enabled: enabled,
        child: FocusableActionDetector(
          enabled: enabled,
          mouseCursor: enabled ? SystemMouseCursors.click : MouseCursor.defer,
          onShowHoverHighlight: (on) => set(WidgetState.hovered, on),
          onShowFocusHighlight: (on) => set(WidgetState.focused, on),
          actions: {
            ActivateIntent: CallbackAction<ActivateIntent>(
              onInvoke: (_) {
                onPressed?.call();
                return null;
              },
            ),
          },
          child: GestureDetector(
            onTapDown: enabled ? (_) => set(WidgetState.pressed, true) : null,
            onTapUp: enabled ? (_) => set(WidgetState.pressed, false) : null,
            onTapCancel: enabled ? () => set(WidgetState.pressed, false) : null,
            onTap: onPressed,
            child: ListenableBuilder(
              listenable: states,
              builder: (context, _) => builder(context, {...states.value}),
            ),
          ),
        ),
      );
    },
  );
}
