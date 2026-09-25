/// SOLAR RowExpand.
///
/// Written by hand, and never regenerated; its layer tree is the IR's, [SolarRowExpandRecipe.tree].
/// What it looks like is not here. That is the recipe, [SolarRowExpandRecipe]: each type’s chevron
/// or connector, their colours and places, read cell by cell.
///
/// Bespoke: an expandable table row's cell, drawn from Figma's layer tree with [SolarLayers]: the
/// chevron on the parent row, and the connector beside each child row. Decorative: the row it
/// belongs to is the control that expands, and says so.
library;

import 'package:flutter/material.dart';

import '../generated/components/rowexpand.dart';
import '../generated/icons.dart';
import '../solar_layers.dart';
import 'solar_theme_of.dart';

class SolarRowExpand extends StatelessWidget {
  const SolarRowExpand({super.key, this.type = SolarRowExpandType.titleRow});

  final SolarRowExpandType type;

  @override
  Widget build(BuildContext context) {
    final t = solarThemeOf(context);
    final p = SolarRowExpandProps(type: type);
    const states = <WidgetState>{};
    final mark = SolarLayers(
      recipe: SolarLayerRecipe(
        lookup: (c) => SolarRowExpandRecipe.lookup(c, p, states),
        dimension: (c) => SolarRowExpandRecipe.dimension(c, p, states),
        color: (c) => SolarRowExpandRecipe.color(t, c, p, states),
        shadow: (c) => SolarRowExpandRecipe.shadow(t, c, p, states),
        textStyle: (c) => SolarRowExpandRecipe.textStyle(t, c, p, states),
        present: (l) => SolarRowExpandRecipe.present(l, p, states),
        glyph: (l) => SolarRowExpandRecipe.glyph(l, p, states),
      ),
      tree: SolarRowExpandRecipe.tree,
      keyPrefix: 'rowExpand',
      icons: const {
        'iconChevronRight': SolarIcons.chevronRightOutline,
        'iconChevronDown': SolarIcons.chevronDownOutline,
      },
    ).layer('root');
    return ExcludeSemantics(child: mark);
  }
}
