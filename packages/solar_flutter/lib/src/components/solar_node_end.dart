/// SOLAR Node End.
///
/// Written by hand, and never regenerated; its layer tree is the IR's, [SolarNodeEndRecipe.tree].
/// What it looks like is not here. That is the recipe, [SolarNodeEndRecipe]: the dot and its halo,
/// their colour, size and place, read cell by cell.
///
/// Bespoke: a drawn marker, the end of a Coachmark's connector, drawn from Figma's layer tree with
/// [SolarLayers]. Decorative always: the element a tour step is about carries its own name, and the
/// dot is never the only sign of what the step refers to.
library;

import 'package:flutter/material.dart';

import '../generated/components/node_end.dart';
import '../solar_layers.dart';
import 'solar_theme_of.dart';

class SolarNodeEnd extends StatelessWidget {
  const SolarNodeEnd({super.key, this.halo = false});

  final bool halo;

  @override
  Widget build(BuildContext context) {
    final t = solarThemeOf(context);
    final p = SolarNodeEndProps(halo: halo);
    const states = <WidgetState>{};
    final mark = SolarLayers(
      recipe: SolarLayerRecipe(
        lookup: (c) => SolarNodeEndRecipe.lookup(c, p, states),
        dimension: (c) => SolarNodeEndRecipe.dimension(c, p, states),
        color: (c) => SolarNodeEndRecipe.color(t, c, p, states),
        shadow: (c) => SolarNodeEndRecipe.shadow(t, c, p, states),
        textStyle: (c) => SolarNodeEndRecipe.textStyle(t, c, p, states),
        present: (l) => SolarNodeEndRecipe.present(l, p, states),
        glyph: (_) => null,
      ),
      tree: SolarNodeEndRecipe.tree,
      keyPrefix: 'nodeEnd',
    ).layer('root');
    return ExcludeSemantics(child: mark);
  }
}
