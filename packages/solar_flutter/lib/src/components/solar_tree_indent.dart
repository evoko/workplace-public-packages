/// SOLAR Tree Indent.
///
/// Scaffolded once by `npm run solar:scaffold -- --flutter Tree Indent` from
/// spec/components/tree-indent.json, and owned by developers from then on: change it freely. What
/// it looks like is not here. That is the recipe, [SolarTreeIndentRecipe]: each depth’s row of
/// units and their size, read cell by cell.
///
/// Bespoke: a spacer, a row of [depth] units of indent, drawn from Figma's layer tree with
/// [SolarLayers]. Tree Item composes it. Decorative: the tree's own semantics say how deep a row
/// is.
library;

import 'package:flutter/material.dart';

import '../generated/components/tree_indent.dart';
import '../solar_layers.dart';
import 'solar_theme_of.dart';

class SolarTreeIndent extends StatelessWidget {
  const SolarTreeIndent({super.key, this.depth = SolarTreeIndentDepth.$00});

  final SolarTreeIndentDepth depth;

  /// Each layer's children, as Figma nests them.
  static const _tree = <String, List<String>>{
    'root': [
      'unit1',
      'unit2',
      'unit3',
      'unit4',
      'unit5',
      'unit6',
      'unit7',
      'unit8',
      'unit10',
      'unit9',
    ],
  };

  @override
  Widget build(BuildContext context) {
    final t = solarThemeOf(context);
    final p = SolarTreeIndentProps(depth: depth);
    const states = <WidgetState>{};
    final mark = SolarLayers(
      recipe: SolarLayerRecipe(
        lookup: (c) => SolarTreeIndentRecipe.lookup(c, p, states),
        dimension: (c) => SolarTreeIndentRecipe.dimension(c, p, states),
        color: (c) => SolarTreeIndentRecipe.color(t, c, p, states),
        shadow: (c) => SolarTreeIndentRecipe.shadow(t, c, p, states),
        textStyle: (c) => SolarTreeIndentRecipe.textStyle(t, c, p, states),
        present: (l) => SolarTreeIndentRecipe.present(l, p, states),
        glyph: (_) => null,
      ),
      tree: _tree,
      keyPrefix: 'treeIndent',
    ).layer('root');
    return ExcludeSemantics(child: mark);
  }
}
