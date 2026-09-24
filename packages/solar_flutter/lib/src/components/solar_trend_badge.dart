/// SOLAR Trend Badge.
///
/// Scaffolded once by `npm run solar:scaffold -- --flutter Trend Badge` from
/// spec/components/trend-badge.json, and owned by developers from then on: change it freely. What
/// it looks like is not here. That is the recipe, [SolarTrendBadgeRecipe]: each type’s disc and its
/// arrow or dash, their colours, by size, read cell by cell.
///
/// Bespoke: a drawn mark, an arrow on a disc, drawn from Figma's layer tree with [SolarLayers].
/// Decorative unless given a [label], which it then announces.
library;

import 'package:flutter/material.dart';

import '../generated/components/trend_badge.dart';
import '../solar_layers.dart';
import 'solar_theme_of.dart';

class SolarTrendBadge extends StatelessWidget {
  const SolarTrendBadge({
    super.key,
    this.type = SolarTrendBadgeType.incline,
    this.size = SolarTrendBadgeSize.md,
    this.label,
  });

  final SolarTrendBadgeType type;
  final SolarTrendBadgeSize size;

  /// What the trend means, for a screen reader. Without it the badge is decorative.
  final String? label;

  /// Each layer's children, as Figma nests them.
  static const _tree = <String, List<String>>{
    'root': ['icon'],
  };

  @override
  Widget build(BuildContext context) {
    final t = solarThemeOf(context);
    final p = SolarTrendBadgeProps(type: type, size: size);
    const states = <WidgetState>{};
    final mark = SolarLayers(
      recipe: SolarLayerRecipe(
        lookup: (c) => SolarTrendBadgeRecipe.lookup(c, p, states),
        dimension: (c) => SolarTrendBadgeRecipe.dimension(c, p, states),
        color: (c) => SolarTrendBadgeRecipe.color(t, c, p, states),
        shadow: (c) => SolarTrendBadgeRecipe.shadow(t, c, p, states),
        textStyle: (c) => SolarTrendBadgeRecipe.textStyle(t, c, p, states),
        present: (l) => SolarTrendBadgeRecipe.present(l, p, states),
        glyph: (l) => SolarTrendBadgeRecipe.glyph(l, p, states),
      ),
      tree: _tree,
      keyPrefix: 'trendBadge',
    ).layer('root');
    return label == null
        ? ExcludeSemantics(child: mark)
        : Semantics(label: label, image: true, child: mark);
  }
}
