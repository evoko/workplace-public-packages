/// SOLAR Options List.
///
/// Written by hand, and never regenerated; its layer tree is the IR's,
/// [SolarOptionsListRecipe.tree]. What it looks like is not here. That is the recipe,
/// [SolarOptionsListRecipe]: the list’s gap, and its rows’ place, read cell by cell.
///
/// Bespoke: the group around SolarOptionRows that answer one question, drawn from Figma's layer
/// tree with [SolarLayers] and named by its [label], which a screen reader reads and the page does
/// not show (Figma draws none). One kind of control a list: radios go under one [RadioGroup]. Above
/// five choices of one, SOLAR says, use a Select.
library;

import 'package:flutter/material.dart';

import '../generated/components/options_list.dart';
import '../solar_layers.dart';
import 'solar_theme_of.dart';

class SolarOptionsList extends StatelessWidget {
  const SolarOptionsList({
    super.key,
    required this.label,
    required this.children,
  });

  /// The question the rows answer, read by a screen reader.
  final String label;

  /// The rows: SolarOptionRows of one control.
  final List<Widget> children;

  @override
  Widget build(BuildContext context) {
    final t = solarThemeOf(context);
    const p = SolarOptionsListProps();
    const states = <WidgetState>{};
    final mark = SolarLayers(
      recipe: SolarLayerRecipe(
        lookup: (c) => SolarOptionsListRecipe.lookup(c, p, states),
        dimension: (c) => SolarOptionsListRecipe.dimension(c, p, states),
        color: (c) => SolarOptionsListRecipe.color(t, c, p, states),
        shadow: (c) => SolarOptionsListRecipe.shadow(t, c, p, states),
        textStyle: (c) => SolarOptionsListRecipe.textStyle(t, c, p, states),
        present: (l) => SolarOptionsListRecipe.present(l, p, states),
        glyph: (_) => null,
      ),
      tree: SolarOptionsListRecipe.tree,
      keyPrefix: 'optionsList',
      content: {'content': children},
    ).layer('root');
    return Semantics(
      container: true,
      explicitChildNodes: true,
      label: label,
      child: mark,
    );
  }
}
