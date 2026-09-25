/// SOLAR Section Nav Item.
///
/// Written by hand, and never regenerated; its layer tree is the IR's,
/// [SolarSectionNavItemRecipe.tree]. What it looks like is not here. That is the recipe,
/// [SolarSectionNavItemRecipe]: the item’s fill and focus ring by state, and its icon’s and label’s
/// ink, read cell by cell.
///
/// Bespoke: one item of a section nav rail, the settings and admin sub-navigation (a sidebar's
/// destinations are SolarNavItems), drawn from Figma's layer tree with [SolarLayers], pressable and
/// focusable. The [selected] one is the current page, announced selected, drawn by its fill, not
/// colour alone. It spans its rail. Group them under SolarSectionNavGroupHeaders.
library;

import 'package:flutter/material.dart';

import '../generated/components/section_nav_item.dart';
import '../solar_layers.dart';
import '../solar_states.dart';
import 'solar_theme_of.dart';

class SolarSectionNavItem extends StatelessWidget {
  const SolarSectionNavItem({
    super.key,
    this.selected = false,
    required this.label,
    required this.icon,
    required this.onPressed,
    this.statesController,
  });

  final bool selected;

  /// Where it goes.
  final String label;

  /// An icon before the words.
  final Widget icon;

  /// Called when it is chosen; null disables it.
  final VoidCallback? onPressed;

  /// Whether it is disabled: by a null [onPressed], as Flutter's own controls are, not a
  /// parameter of its own.
  bool get disabled => onPressed == null;

  /// Its states, where the caller keeps them.
  final WidgetStatesController? statesController;

  @override
  Widget build(BuildContext context) {
    final t = solarThemeOf(context);
    final p = SolarSectionNavItemProps(selected: selected, disabled: disabled);
    Widget draw(Set<WidgetState> states) => SolarLayers(
      recipe: SolarLayerRecipe(
        lookup: (c) => SolarSectionNavItemRecipe.lookup(c, p, states),
        dimension: (c) => SolarSectionNavItemRecipe.dimension(c, p, states),
        color: (c) => SolarSectionNavItemRecipe.color(t, c, p, states),
        shadow: (c) => SolarSectionNavItemRecipe.shadow(t, c, p, states),
        textStyle: (c) => SolarSectionNavItemRecipe.textStyle(t, c, p, states),
        present: (l) => SolarSectionNavItemRecipe.present(l, p, states),
        glyph: (_) => null,
      ),
      tree: SolarSectionNavItemRecipe.tree,
      keyPrefix: 'sectionNavItem',
      text: {'label': label},
      slots: {'icon': icon},
    ).layer('root');
    final mark = SolarPressable(
      onPressed: disabled ? null : onPressed,
      statesController: statesController,
      selected: selected,
      target: false,
      builder: (_, states) => draw(states),
    );
    return mark;
  }
}
