/// SOLAR Tabs.
///
/// Written by hand, and never regenerated; its layer tree is the IR's, [SolarTabsRecipe.tree]. What
/// it looks like is not here. That is the recipe, [SolarTabsRecipe]: the strip’s edge under its
/// tabs, read cell by cell.
///
/// Bespoke: a strip of two to seven SolarTabItems of its size, one selected, drawn from Figma's
/// layer tree with [SolarLayers] around its [children]: the arrow keys move the focus from tab to
/// tab, and Enter or Space selects the focused one, as SOLAR's description says; it is announced as
/// a tab bar. [value] is the selected tab's value, and [onChanged] is called with the value of the
/// tab chosen. It does not scroll.
library;

import 'package:flutter/material.dart';

import '../generated/components/tabs.dart';
import '../solar_layers.dart';
import '../solar_tabs.dart';
import 'solar_theme_of.dart';

class SolarTabs extends StatelessWidget {
  const SolarTabs({
    super.key,
    this.size = SolarTabsSize.sm,
    required this.children,
    this.value,
    this.onChanged,
  });

  final SolarTabsSize size;

  /// Two to seven SolarTabItems, each with a value.
  final List<Widget> children;

  /// The selected tab's value; null for none.
  final Object? value;

  /// Called with the value of the tab chosen.
  final ValueChanged<Object?>? onChanged;

  @override
  Widget build(BuildContext context) {
    final t = solarThemeOf(context);
    final p = SolarTabsProps(size: size);
    const states = <WidgetState>{};
    final mark = SolarLayers(
      recipe: SolarLayerRecipe(
        lookup: (c) => SolarTabsRecipe.lookup(c, p, states),
        dimension: (c) => SolarTabsRecipe.dimension(c, p, states),
        color: (c) => SolarTabsRecipe.color(t, c, p, states),
        shadow: (c) => SolarTabsRecipe.shadow(t, c, p, states),
        textStyle: (c) => SolarTabsRecipe.textStyle(t, c, p, states),
        present: (l) => SolarTabsRecipe.present(l, p, states),
        glyph: (_) => null,
      ),
      tree: SolarTabsRecipe.tree,
      keyPrefix: 'tabs',
      content: {'tabs': children},
      builders: {'tabs': (layer) => SolarTabList(child: layer)},
    ).layer('root');
    return SolarTabsScope(
      size: size.name,
      value: value,
      onChanged: onChanged,
      child: mark,
    );
  }
}
