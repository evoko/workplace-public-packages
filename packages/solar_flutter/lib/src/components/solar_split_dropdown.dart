/// SOLAR Split Dropdown.
///
/// Written by hand, and never regenerated; its layer tree is the IR's,
/// [SolarSplitDropdownRecipe.tree]. What it looks like is not here. That is the recipe,
/// [SolarSplitDropdownRecipe]: its edge and radius, and each zone’s fill and padding, read cell by
/// cell.
///
/// A box of two zones pairing a primary control with supporting details: the [top] (the control) on
/// the raised surface, and the [lower] strip (the details) tinted under it. Nothing in it opens or
/// toggles: each zone is the caller's. Bespoke: drawn from Figma's layer tree with [SolarLayers].
library;

import 'package:flutter/material.dart';

import '../generated/components/split_dropdown.dart';
import '../solar_layers.dart';
import 'solar_theme_of.dart';

class SolarSplitDropdown extends StatelessWidget {
  const SolarSplitDropdown({super.key, this.top, this.lower});

  /// The top zone's content: the primary control.
  final Widget? top;

  /// The lower strip's content: the supporting details.
  final Widget? lower;

  @override
  Widget build(BuildContext context) {
    final t = solarThemeOf(context);
    const p = SolarSplitDropdownProps();
    const states = <WidgetState>{};
    final mark = SolarLayers(
      recipe: SolarLayerRecipe(
        lookup: (c) => SolarSplitDropdownRecipe.lookup(c, p, states),
        dimension: (c) => SolarSplitDropdownRecipe.dimension(c, p, states),
        color: (c) => SolarSplitDropdownRecipe.color(t, c, p, states),
        shadow: (c) => SolarSplitDropdownRecipe.shadow(t, c, p, states),
        textStyle: (c) => SolarSplitDropdownRecipe.textStyle(t, c, p, states),
        present: (l) => SolarSplitDropdownRecipe.present(l, p, states),
        glyph: (_) => null,
      ),
      tree: SolarSplitDropdownRecipe.tree,
      keyPrefix: 'splitDropdown',
      content: {
        'topContent': [?top],
        'lowerContent': [?lower],
      },
      clips: const {'root'},
    ).layer('root');
    return mark;
  }
}
