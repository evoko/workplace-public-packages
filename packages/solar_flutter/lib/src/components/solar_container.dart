/// SOLAR Container.
///
/// Written by hand, and never regenerated; its layer tree is the IR's, [SolarContainerRecipe.tree].
/// What it looks like is not here. That is the recipe, [SolarContainerRecipe]: its padding and gap,
/// and the outlined one’s surface, edge and shadow, read cell by cell.
///
/// A region grouping related content inside a larger surface (a card's body, a dialog's, a part of
/// a page): the caller's content, padded, with no paint of its own ([default]) or on a raised
/// surface with an edge ([outlined]). No control, and no card: for a raised surface of its own use
/// a Card. Bespoke: drawn from Figma's layer tree with [SolarLayers].
library;

import 'package:flutter/material.dart';

import '../generated/components/container.dart';
import '../solar_layers.dart';
import 'solar_theme_of.dart';

class SolarContainer extends StatelessWidget {
  const SolarContainer({
    super.key,
    this.type = SolarContainerType.$default,
    this.children = const [],
  });

  final SolarContainerType type;

  /// What it groups.
  final List<Widget> children;

  @override
  Widget build(BuildContext context) {
    final t = solarThemeOf(context);
    final p = SolarContainerProps(type: type);
    const states = <WidgetState>{};
    final mark = SolarLayers(
      recipe: SolarLayerRecipe(
        lookup: (c) => SolarContainerRecipe.lookup(c, p, states),
        dimension: (c) => SolarContainerRecipe.dimension(c, p, states),
        color: (c) => SolarContainerRecipe.color(t, c, p, states),
        shadow: (c) => SolarContainerRecipe.shadow(t, c, p, states),
        textStyle: (c) => SolarContainerRecipe.textStyle(t, c, p, states),
        present: (l) => SolarContainerRecipe.present(l, p, states),
        glyph: (_) => null,
      ),
      tree: SolarContainerRecipe.tree,
      keyPrefix: 'container',
      content: {'content': children},
    ).layer('root');
    return mark;
  }
}
