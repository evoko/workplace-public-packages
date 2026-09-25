/// SOLAR StatusIndicator.
///
/// Written by hand, and never regenerated; its layer tree is the IR's,
/// [SolarStatusIndicatorRecipe.tree]. What it looks like is not here. That is the recipe,
/// [SolarStatusIndicatorRecipe]: each type’s disc or triangle, its mark, their colours and where
/// they sit, read cell by cell.
///
/// Bespoke: a drawn mark. Each type is its own drawing, so this draws Figma's layer tree with
/// [SolarLayers]: a layer as a glyph where the recipe has one and as a box where it does not.
/// Decorative unless given a [label], which it then announces.
library;

import 'package:flutter/material.dart';

import '../generated/components/statusindicator.dart';
import '../solar_layers.dart';
import 'solar_theme_of.dart';

class SolarStatusIndicator extends StatelessWidget {
  const SolarStatusIndicator({
    super.key,
    this.type = SolarStatusIndicatorType.success,
    this.size = SolarStatusIndicatorSize.md,
    this.label,
    this.restyle = const {},
  });

  final SolarStatusIndicatorType type;
  final SolarStatusIndicatorSize size;

  /// What the status means, for a screen reader. Without it the mark is decorative.
  final String? label;

  /// The colours a component that holds it draws it in, by cell (a Data Legend's swatch:
  /// `root.background`, its series' colour), over the recipe's.
  final Map<String, Color> restyle;

  @override
  Widget build(BuildContext context) {
    final t = solarThemeOf(context);
    final p = SolarStatusIndicatorProps(type: type, size: size);
    const states = <WidgetState>{};
    final mark = SolarLayers(
      recipe: SolarLayerRecipe(
        lookup: (c) => SolarStatusIndicatorRecipe.lookup(c, p, states),
        dimension: (c) => SolarStatusIndicatorRecipe.dimension(c, p, states),
        color: (c) =>
            restyle[c] ?? SolarStatusIndicatorRecipe.color(t, c, p, states),
        shadow: (c) => SolarStatusIndicatorRecipe.shadow(t, c, p, states),
        textStyle: (c) => SolarStatusIndicatorRecipe.textStyle(t, c, p, states),
        present: (l) => SolarStatusIndicatorRecipe.present(l, p, states),
        glyph: (l) => SolarStatusIndicatorRecipe.glyph(l, p, states),
      ),
      tree: SolarStatusIndicatorRecipe.tree,
      keyPrefix: 'statusIndicator',
    ).layer('root');
    return label == null
        ? ExcludeSemantics(child: mark)
        : Semantics(label: label, image: true, child: mark);
  }
}
