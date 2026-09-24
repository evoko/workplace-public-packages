import 'package:flutter/widgets.dart';

/// Marks what is inside a list (a SolarList's rows): a row takes the list's compactness, as Figma
/// draws its rows, compact in one list and not in the other.
///
/// Hand written: the list provides it, and the rows read it.
class SolarListScope extends InheritedWidget {
  /// Marks [child] as inside a list whose rows are [compact] or not.
  const SolarListScope({
    super.key,
    required this.compact,
    required super.child,
  });

  /// Whether the list's rows are compact.
  final bool compact;

  /// The compactness of the list around [context]; null outside one.
  static bool? compactOf(BuildContext context) =>
      context.dependOnInheritedWidgetOfExactType<SolarListScope>()?.compact;

  @override
  bool updateShouldNotify(SolarListScope oldWidget) =>
      compact != oldWidget.compact;
}
