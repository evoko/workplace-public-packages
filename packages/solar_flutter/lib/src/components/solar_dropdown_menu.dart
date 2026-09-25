/// SOLAR Dropdown Menu.
///
/// Written by hand, and never regenerated; its layer tree is the IR's,
/// [SolarDropdownMenuRecipe.tree]. What it looks like is not here. That is the recipe,
/// [SolarDropdownMenuRecipe]: the surface’s fill, edge, corners and shadow, read cell by cell.
///
/// Bespoke: the surface of a trigger's SolarDropdownItems and SolarDropdownGroupLabels, drawn from
/// Figma's layer tree with [SolarLayers] around a [SolarMenuList]: the arrow keys move the focus
/// from row to row, and its rows take its size. It draws where it is put; to float it under its
/// trigger, give it to a [SolarMenuAnchor], which closes it on Escape or a tap outside. Past 300
/// its rows scroll, as SOLAR's description says.
library;

import 'package:flutter/material.dart';

import '../generated/components/dropdown_menu.dart';
import '../solar_layers.dart';
import '../solar_menu.dart';
import 'solar_theme_of.dart';

class SolarDropdownMenu extends StatelessWidget {
  const SolarDropdownMenu({
    super.key,
    this.size = SolarDropdownMenuSize.md,
    required this.children,
    this.maxHeight = solarMenuMaxHeight,
  });

  final SolarDropdownMenuSize size;

  /// The rows and headings: SolarDropdownItems, and SolarDropdownGroupLabels between them.
  final List<Widget> children;

  /// The tallest it grows before its rows scroll.
  final double maxHeight;

  @override
  Widget build(BuildContext context) {
    final t = solarThemeOf(context);
    final p = SolarDropdownMenuProps(size: size);
    const states = <WidgetState>{};
    final mark = SolarLayers(
      recipe: SolarLayerRecipe(
        lookup: (c) => SolarDropdownMenuRecipe.lookup(c, p, states),
        dimension: (c) => SolarDropdownMenuRecipe.dimension(c, p, states),
        color: (c) => SolarDropdownMenuRecipe.color(t, c, p, states),
        shadow: (c) => SolarDropdownMenuRecipe.shadow(t, c, p, states),
        textStyle: (c) => SolarDropdownMenuRecipe.textStyle(t, c, p, states),
        present: (l) => SolarDropdownMenuRecipe.present(l, p, states),
        glyph: (_) => null,
      ),
      tree: SolarDropdownMenuRecipe.tree,
      keyPrefix: 'dropdownMenu',
      content: {
        'content': [
          SolarMenuList(
            size: size.name,
            maxHeight: maxHeight,
            children: children,
          ),
        ],
      },
    ).layer('root');
    return mark;
  }
}
