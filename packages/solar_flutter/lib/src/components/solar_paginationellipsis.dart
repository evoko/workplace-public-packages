/// SOLAR PaginationEllipsis.
///
/// Written by hand, and never regenerated; its layer tree is the IR's,
/// [SolarPaginationEllipsisRecipe.tree]. What it looks like is not here. That is the recipe,
/// [SolarPaginationEllipsisRecipe]: its box and its words’ text style and ink, read cell by cell.
///
/// Bespoke: the gap in a SolarPagination's pages, an ellipsis drawn from Figma's layer tree with
/// [SolarLayers]: static text, never a control, as its description says.
library;

import 'package:flutter/material.dart';

import '../generated/components/paginationellipsis.dart';
import '../solar_layers.dart';
import 'solar_theme_of.dart';

class SolarPaginationEllipsis extends StatelessWidget {
  const SolarPaginationEllipsis({super.key});

  @override
  Widget build(BuildContext context) {
    final t = solarThemeOf(context);
    const p = SolarPaginationEllipsisProps();
    const states = <WidgetState>{};
    final mark = SolarLayers(
      recipe: SolarLayerRecipe(
        lookup: (c) => SolarPaginationEllipsisRecipe.lookup(c, p, states),
        dimension: (c) => SolarPaginationEllipsisRecipe.dimension(c, p, states),
        color: (c) => SolarPaginationEllipsisRecipe.color(t, c, p, states),
        shadow: (c) => SolarPaginationEllipsisRecipe.shadow(t, c, p, states),
        textStyle: (c) =>
            SolarPaginationEllipsisRecipe.textStyle(t, c, p, states),
        present: (l) => SolarPaginationEllipsisRecipe.present(l, p, states),
        glyph: (_) => null,
      ),
      tree: SolarPaginationEllipsisRecipe.tree,
      keyPrefix: 'paginationEllipsis',
      text: {'label': '…'},
    ).layer('root');
    return mark;
  }
}
