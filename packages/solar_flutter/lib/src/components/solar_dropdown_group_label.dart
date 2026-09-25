/// SOLAR Dropdown Group Label.
///
/// Written by hand, and never regenerated; its layer tree is the IR's,
/// [SolarDropdownGroupLabelRecipe.tree]. What it looks like is not here. That is the recipe,
/// [SolarDropdownGroupLabelRecipe]: the heading’s fill, padding and text style, by size, read cell
/// by cell.
///
/// Bespoke: a section's heading in a SolarDropdownMenu ('Recent', 'All projects'), drawn from
/// Figma's layer tree with [SolarLayers], announced as a heading, and passed over by the menu's
/// keyboard. In a menu it takes the menu's size. SOLAR says to use it only where a menu has three
/// or more kinds of row.
library;

import 'package:flutter/material.dart';

import '../generated/components/dropdown_group_label.dart';
import '../solar_layers.dart';
import '../solar_menu.dart';
import 'solar_theme_of.dart';

class SolarDropdownGroupLabel extends StatelessWidget {
  const SolarDropdownGroupLabel({
    super.key,
    this.size = SolarDropdownGroupLabelSize.md,
    required this.label,
  });

  final SolarDropdownGroupLabelSize size;

  /// The heading's words.
  final String label;

  @override
  Widget build(BuildContext context) {
    final t = solarThemeOf(context);
    final p = SolarDropdownGroupLabelProps(
      size:
          SolarMenuScope.sizeOf(context, SolarDropdownGroupLabelSize.values) ??
          size,
    );
    const states = <WidgetState>{};
    final mark = SolarLayers(
      recipe: SolarLayerRecipe(
        lookup: (c) => SolarDropdownGroupLabelRecipe.lookup(c, p, states),
        dimension: (c) => SolarDropdownGroupLabelRecipe.dimension(c, p, states),
        color: (c) => SolarDropdownGroupLabelRecipe.color(t, c, p, states),
        shadow: (c) => SolarDropdownGroupLabelRecipe.shadow(t, c, p, states),
        textStyle: (c) =>
            SolarDropdownGroupLabelRecipe.textStyle(t, c, p, states),
        present: (l) => SolarDropdownGroupLabelRecipe.present(l, p, states),
        glyph: (_) => null,
      ),
      tree: SolarDropdownGroupLabelRecipe.tree,
      keyPrefix: 'dropdownGroupLabel',
      text: {'groupLabel': label},
    ).layer('root');
    return Semantics(header: true, child: mark);
  }
}
