/// SOLAR Context Menu.
///
/// Written by hand, and never regenerated; its layer tree is the IR's,
/// [SolarContextMenuRecipe.tree]. What it looks like is not here. That is the recipe,
/// [SolarContextMenuRecipe]: the surface’s fill, edge, corners and shadow, read cell by cell.
///
/// Bespoke: the surface of an object's actions, SolarContextMenuItems with SolarDividers between
/// them, drawn from Figma's layer tree with [SolarLayers] around a [SolarMenuList]: the arrow keys
/// move the focus from row to row. It draws where it is put; to float it at the pointer, give it to
/// a [SolarMenuAnchor] and open its controller at the point (`controller.open(position: …)`). For a
/// toolbar's actions, use a SolarDropdownMenu.
library;

import 'package:flutter/material.dart';

import '../generated/components/context_menu.dart';
import '../solar_layers.dart';
import '../solar_menu.dart';
import 'solar_theme_of.dart';

class SolarContextMenu extends StatelessWidget {
  const SolarContextMenu({
    super.key,
    required this.children,
    this.maxHeight = solarMenuMaxHeight,
  });

  /// The actions: SolarContextMenuItems, and SolarDividers between their groups.
  final List<Widget> children;

  /// The tallest it grows before its rows scroll.
  final double maxHeight;

  @override
  Widget build(BuildContext context) {
    final t = solarThemeOf(context);
    const p = SolarContextMenuProps();
    const states = <WidgetState>{};
    final mark = SolarLayers(
      recipe: SolarLayerRecipe(
        lookup: (c) => SolarContextMenuRecipe.lookup(c, p, states),
        dimension: (c) => SolarContextMenuRecipe.dimension(c, p, states),
        color: (c) => SolarContextMenuRecipe.color(t, c, p, states),
        shadow: (c) => SolarContextMenuRecipe.shadow(t, c, p, states),
        textStyle: (c) => SolarContextMenuRecipe.textStyle(t, c, p, states),
        present: (l) => SolarContextMenuRecipe.present(l, p, states),
        glyph: (_) => null,
      ),
      tree: SolarContextMenuRecipe.tree,
      keyPrefix: 'contextMenu',
      content: {
        'content': [SolarMenuList(maxHeight: maxHeight, children: children)],
      },
    ).layer('root');
    return mark;
  }
}
