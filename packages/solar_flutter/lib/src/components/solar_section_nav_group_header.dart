/// SOLAR Section Nav Group Header.
///
/// Written by hand, and never regenerated; its layer tree is the IR's,
/// [SolarSectionNavGroupHeaderRecipe.tree]. What it looks like is not here. That is the recipe,
/// [SolarSectionNavGroupHeaderRecipe]: its words’ text style and ink, and its padding, read cell by
/// cell.
///
/// Bespoke: the heading of a group of SolarSectionNavItems in a section nav rail, drawn from
/// Figma's layer tree with [SolarLayers], not interactive, and announced as a heading ([level], 3
/// by default) so a screen reader names the group, as its description asks.
library;

import 'package:flutter/material.dart';

import '../generated/components/section_nav_group_header.dart';
import '../solar_layers.dart';
import 'solar_theme_of.dart';

class SolarSectionNavGroupHeader extends StatelessWidget {
  const SolarSectionNavGroupHeader({
    super.key,
    required this.label,
    this.level = 3,
  });

  /// The group's name.
  final String label;

  /// Its heading level, for a screen reader.
  final int level;

  @override
  Widget build(BuildContext context) {
    final t = solarThemeOf(context);
    const p = SolarSectionNavGroupHeaderProps();
    const states = <WidgetState>{};
    final mark = SolarLayers(
      recipe: SolarLayerRecipe(
        lookup: (c) => SolarSectionNavGroupHeaderRecipe.lookup(c, p, states),
        dimension: (c) =>
            SolarSectionNavGroupHeaderRecipe.dimension(c, p, states),
        color: (c) => SolarSectionNavGroupHeaderRecipe.color(t, c, p, states),
        shadow: (c) => SolarSectionNavGroupHeaderRecipe.shadow(t, c, p, states),
        textStyle: (c) =>
            SolarSectionNavGroupHeaderRecipe.textStyle(t, c, p, states),
        present: (l) => SolarSectionNavGroupHeaderRecipe.present(l, p, states),
        glyph: (_) => null,
      ),
      tree: SolarSectionNavGroupHeaderRecipe.tree,
      keyPrefix: 'sectionNavGroupHeader',
      text: {'label': label},
    ).layer('root');
    return Semantics(header: true, headingLevel: level, child: mark);
  }
}
