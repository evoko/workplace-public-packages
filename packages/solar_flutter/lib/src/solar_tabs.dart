import 'package:flutter/material.dart';
import 'package:flutter/semantics.dart';
import 'package:flutter/services.dart';

/// Marks what is inside a Tabs strip (a SolarTabs' tabs): a tab takes the strip's size, as Figma
/// draws its tabs, is selected where its value is the strip's, and selects its value when pressed.
/// Outside one, a tab is selected and pressed as its own props say.
///
/// Hand written: SolarTabs provides it, and SolarTabItem reads it.
class SolarTabsScope extends InheritedWidget {
  /// Marks [child] as inside a strip of [size] (Figma's value, `sm` or `md`), whose selected tab is
  /// the one of [value], and which [onChanged] tells of a tab chosen.
  const SolarTabsScope({
    super.key,
    this.size,
    this.value,
    this.onChanged,
    required super.child,
  });

  /// The strip's size, as Figma names it; null where it has none.
  final String? size;

  /// The selected tab's value; null for none.
  final Object? value;

  /// Called with a tab's value when it is chosen.
  final ValueChanged<Object?>? onChanged;

  /// The strip around [context], or null outside one.
  static SolarTabsScope? maybeOf(BuildContext context) =>
      context.dependOnInheritedWidgetOfExactType<SolarTabsScope>();

  /// The strip's size around [context], as a tab's own size enum, from its [values]; null outside
  /// a strip, or in one of no size.
  static T? sizeOf<T extends Enum>(BuildContext context, List<T> values) {
    final size = maybeOf(context)?.size;
    if (size == null) return null;
    for (final v in values) {
      if (v.name == size) return v;
    }
    return null;
  }

  @override
  bool updateShouldNotify(SolarTabsScope oldWidget) =>
      size != oldWidget.size ||
      value != oldWidget.value ||
      onChanged != oldWidget.onChanged;
}

/// A Tabs strip's tabs, as its tabs layer lays them out: a row the arrow keys move the focus along,
/// Enter or Space selecting the focused tab (owner decision 2026-09-24: the arrows move the focus,
/// as SOLAR's description says), announced as a tab bar. It does not scroll: SOLAR's strip holds
/// two to seven tabs, and a scroll would clip the focused tab's ring.
class SolarTabList extends StatelessWidget {
  /// Marks [child], the laid-out tabs, as a tab bar.
  const SolarTabList({super.key, required this.child});

  /// The tabs layer, as drawn.
  final Widget child;

  @override
  Widget build(BuildContext context) => Shortcuts(
    shortcuts: const {
      SingleActivator(LogicalKeyboardKey.arrowRight): NextFocusIntent(),
      SingleActivator(LogicalKeyboardKey.arrowLeft): PreviousFocusIntent(),
    },
    child: FocusTraversalGroup(
      policy: OrderedTraversalPolicy(),
      // The tab bar's node holds the tabs' own, and nothing between: Flutter requires it.
      child: Semantics(
        role: SemanticsRole.tabBar,
        explicitChildNodes: true,
        child: child,
      ),
    ),
  );
}
