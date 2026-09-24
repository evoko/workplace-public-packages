/// SOLAR Divider.
///
/// Scaffolded once by `npm run solar:scaffold -- --flutter Divider` from
/// spec/components/divider.json, and owned by developers from then on: change it freely. What it
/// looks like is not here. That is the recipe, [SolarDividerRecipe]: the rule’s colour and
/// thickness, the label’s text style, and each type’s gap and inset, read cell by cell.
///
/// Bespoke: a rule, an inset rule, or a label between two rules, drawn from Figma's layer tree with
/// [SolarLayers]. It fills what it separates: a horizontal divider the width it is given, a
/// vertical one the height, so give a vertical one a bounded height (a row's).
library;

import 'package:flutter/material.dart';

import '../generated/components/divider.dart';
import '../solar_layers.dart';
import 'solar_theme_of.dart';

class SolarDivider extends StatelessWidget {
  const SolarDivider({
    super.key,
    this.orientation = SolarDividerOrientation.horizontal,
    this.type = SolarDividerType.full,
    this.label,
  });

  final SolarDividerOrientation orientation;
  final SolarDividerType type;

  /// For with-label: the words between the rules ('Or').
  final String? label;

  /// Each layer's children, as Figma nests them.
  static const _tree = <String, List<String>>{
    'root': ['rule', 'label', 'rule2'],
  };

  @override
  Widget build(BuildContext context) {
    final t = solarThemeOf(context);
    final p = SolarDividerProps(orientation: orientation, type: type);
    const states = <WidgetState>{};
    final mark = SolarLayers(
      recipe: SolarLayerRecipe(
        lookup: (c) => SolarDividerRecipe.lookup(c, p, states),
        dimension: (c) => SolarDividerRecipe.dimension(c, p, states),
        color: (c) => SolarDividerRecipe.color(t, c, p, states),
        shadow: (c) => SolarDividerRecipe.shadow(t, c, p, states),
        textStyle: (c) => SolarDividerRecipe.textStyle(t, c, p, states),
        present: (l) => SolarDividerRecipe.present(l, p, states),
        glyph: (_) => null,
      ),
      tree: _tree,
      keyPrefix: 'divider',
      text: {'label': ?label},
    ).layer('root');
    return mark;
  }
}
