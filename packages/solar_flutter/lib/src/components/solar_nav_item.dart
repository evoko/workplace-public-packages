/// SOLAR Nav Item.
///
/// Written by hand, and never regenerated; its layer tree is the IR's, [SolarNavItemRecipe.tree].
/// What it looks like is not here. That is the recipe, [SolarNavItemRecipe]: the item’s fill by
/// state, and its icon’s and label’s ink, collapsed and expanded, read cell by cell.
///
/// Bespoke: one destination of a sidebar or a top bar, drawn from Figma's layer tree with
/// [SolarLayers], pressable and focusable. The [selected] one is the current page, announced
/// selected, its icon solid ([iconSolid], where given) as Figma swaps it. [expanded], it shows its
/// [label] beside its icon and fills its sidebar; collapsed, it is its icon alone, a 40px square,
/// named by its label for a screen reader. A focused item draws SOLAR's focus ring.
library;

import 'package:flutter/material.dart';

import '../generated/components/nav_item.dart';
import '../solar_layers.dart';
import '../solar_states.dart';
import 'solar_theme_of.dart';

class SolarNavItem extends StatelessWidget {
  const SolarNavItem({
    super.key,
    this.selected = false,
    this.expanded = false,
    required this.label,
    required this.iconOutline,
    required this.onPressed,
    this.iconSolid,
    this.statesController,
  });

  final bool selected;
  final bool expanded;

  /// Where it goes, and its name: drawn expanded, read collapsed.
  final String label;

  /// Its icon, outlined, as it is drawn at rest.
  final Widget iconOutline;

  /// Called when it is chosen; null disables it.
  final VoidCallback? onPressed;

  /// Its icon while selected, solid; the outlined one where none is given.
  final Widget? iconSolid;

  /// Its states, where the caller keeps them.
  final WidgetStatesController? statesController;

  @override
  Widget build(BuildContext context) {
    final t = solarThemeOf(context);
    final p = SolarNavItemProps(selected: selected, expanded: expanded);
    Widget draw(Set<WidgetState> states) => SolarLayers(
      recipe: SolarLayerRecipe(
        lookup: (c) => SolarNavItemRecipe.lookup(c, p, states),
        dimension: (c) => SolarNavItemRecipe.dimension(c, p, states),
        color: (c) => SolarNavItemRecipe.color(t, c, p, states),
        shadow: (c) => SolarNavItemRecipe.shadow(t, c, p, states),
        textStyle: (c) => SolarNavItemRecipe.textStyle(t, c, p, states),
        present: (l) => SolarNavItemRecipe.present(l, p, states),
        glyph: (_) => null,
      ),
      tree: SolarNavItemRecipe.tree,
      keyPrefix: 'navItem',
      text: {'label': label},
      slots: {
        'iconOutline': selected ? (iconSolid ?? iconOutline) : iconOutline,
      },
    ).layer('root');
    final mark = SolarPressable(
      onPressed: onPressed,
      statesController: statesController,
      selected: selected,
      target: true,
      builder: (_, states) => draw(states),
    );
    return expanded ? mark : Semantics(label: label, child: mark);
  }
}
