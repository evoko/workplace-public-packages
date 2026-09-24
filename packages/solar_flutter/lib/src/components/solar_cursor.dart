/// SOLAR Cursor.
///
/// Scaffolded once by `npm run solar:scaffold -- --flutter Cursor` from
/// spec/components/cursor.json, and owned by developers from then on: change it freely. What it
/// looks like is not here. That is the recipe, [SolarCursorRecipe]: each type’s glyph, its colours
/// and outline, read cell by cell.
///
/// Bespoke: a pointer glyph for the canvas and authoring surfaces (the Spatial and Flow editors),
/// where the native cursor cannot say which tool is active, drawn from Figma's layer tree with
/// [SolarLayers]. Decorative: the tool it shows is said elsewhere, and standard UI keeps the native
/// cursor.
library;

import 'package:flutter/material.dart';

import '../generated/components/cursor.dart';
import '../solar_layers.dart';
import 'solar_theme_of.dart';

class SolarCursor extends StatelessWidget {
  const SolarCursor({super.key, this.type = SolarCursorType.$default});

  final SolarCursorType type;

  /// Each layer's children, as Figma nests them.
  static const _tree = <String, List<String>>{
    'root': [
      'rectangle237',
      'importedLayersCopy4',
      'oval3',
      'rectangle8',
      'rectangle254',
      'path',
      'oval38',
      'oval',
      'rectangle6',
      'rectangle272',
    ],
  };

  @override
  Widget build(BuildContext context) {
    final t = solarThemeOf(context);
    final p = SolarCursorProps(type: type);
    const states = <WidgetState>{};
    final mark = SolarLayers(
      recipe: SolarLayerRecipe(
        lookup: (c) => SolarCursorRecipe.lookup(c, p, states),
        dimension: (c) => SolarCursorRecipe.dimension(c, p, states),
        color: (c) => SolarCursorRecipe.color(t, c, p, states),
        shadow: (c) => SolarCursorRecipe.shadow(t, c, p, states),
        textStyle: (c) => SolarCursorRecipe.textStyle(t, c, p, states),
        present: (l) => SolarCursorRecipe.present(l, p, states),
        glyph: (l) => SolarCursorRecipe.glyph(l, p, states),
      ),
      tree: _tree,
      keyPrefix: 'cursor',
    ).layer('root');
    return ExcludeSemantics(child: mark);
  }
}
