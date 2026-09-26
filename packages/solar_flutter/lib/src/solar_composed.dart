import 'package:flutter/widgets.dart';

import 'generated/components/counter.dart';

/// The Counter type a parent's recipe composes, for a SolarCounter the caller passes it as a widget:
/// a SolarButton's `counter` is the app's own widget, and Figma draws the Counter in it in a type of
/// the Button's (`inverted` in a primary one, `regular` in the others). The Button puts this around
/// its counter, and a SolarCounter with no [SolarCounter.type] of its own takes it, so
/// `SolarCounter(count: 3)` in a Button is drawn as Figma draws it without the app repeating the
/// recipe; a type the caller gives still wins. The web does the same with a React context
/// (`internal/composed.ts`).
///
/// Hand written, like [SolarStatesScope]: a helper of its own, not the Counter's shell, so a Button
/// that gives the type does not ship the Counter.
class SolarCounterTypeScope extends InheritedWidget {
  /// Gives [type] to a SolarCounter in [child] that names none.
  const SolarCounterTypeScope({
    super.key,
    required this.type,
    required super.child,
  });

  /// The type the parent's recipe composes its Counter in; null for none.
  final SolarCounterType? type;

  /// The type the parent around [context] composes its Counter in, or null.
  static SolarCounterType? maybeOf(BuildContext context) =>
      context.dependOnInheritedWidgetOfExactType<SolarCounterTypeScope>()?.type;

  @override
  bool updateShouldNotify(SolarCounterTypeScope oldWidget) =>
      oldWidget.type != type;
}
