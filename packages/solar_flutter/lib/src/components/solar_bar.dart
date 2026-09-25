/// SOLAR Bar.
///
/// Written by hand, and never regenerated; its layer tree is the IR's, [SolarBarRecipe.tree]. What
/// it looks like is not here. That is the recipe, [SolarBarRecipe]: its fill, by colour.
///
/// One bar of a chart, as the description says: a rectangle in one of SOLAR's data colours
/// ([color]: the category, scale, delta and feedback palettes). It fills the box it is given, its
/// length and thickness the data's. Decorative: the chart says what it shows.
library;

import 'package:flutter/material.dart';

import '../generated/components/bar.dart';
import '../solar_layers.dart';
import 'solar_theme_of.dart';

class SolarBar extends StatelessWidget {
  const SolarBar({super.key, this.color = SolarBarColor.category01Strong});

  final SolarBarColor color;

  @override
  Widget build(BuildContext context) {
    final t = solarThemeOf(context);
    final p = SolarBarProps(color: color);
    const states = <WidgetState>{};
    return ExcludeSemantics(
      child: SolarLayers(
        recipe: SolarLayerRecipe(
          lookup: (c) => SolarBarRecipe.lookup(c, p, states),
          dimension: (c) => SolarBarRecipe.dimension(c, p, states),
          color: (c) => SolarBarRecipe.color(t, c, p, states),
          shadow: (c) => SolarBarRecipe.shadow(t, c, p, states),
          textStyle: (c) => SolarBarRecipe.textStyle(t, c, p, states),
          present: (l) => SolarBarRecipe.present(l, p, states),
          glyph: (_) => null,
        ),
        tree: SolarBarRecipe.tree,
        keyPrefix: 'bar',
      ).layer('root'),
    );
  }
}
