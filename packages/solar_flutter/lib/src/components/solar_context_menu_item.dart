/// SOLAR Context Menu Item.
///
/// Written by hand, and never regenerated; its layer tree is the IR's,
/// [SolarContextMenuItemRecipe.tree]. What it looks like is not here. That is the recipe,
/// [SolarContextMenuItemRecipe]: the row’s fill by state, and its words’, shortcut’s and icons’
/// ink, destructive or not, read cell by cell.
///
/// Bespoke: one action of a SolarContextMenu, drawn from Figma's layer tree with [SolarLayers],
/// pressable, and focusable in the menu's order. Its words, an icon either side and a keyboard
/// [shortcut] after them. [destructive] is for an action that cannot be undone (Delete), and only
/// that, as SOLAR says. Inside a menu it is announced as a menu item; outside one, as a button. No
/// submenus: one level.
library;

import 'package:flutter/material.dart';

import '../generated/components/context_menu_item.dart';
import '../solar_layers.dart';
import '../solar_states.dart';

import 'package:flutter/semantics.dart';

import '../solar_menu.dart';
import 'solar_theme_of.dart';

class SolarContextMenuItem extends StatelessWidget {
  const SolarContextMenuItem({
    super.key,
    this.destructive = false,
    required this.label,
    required this.onPressed,
    this.leadingIcon,
    this.trailingIcon,
    this.shortcut,
    this.statesController,
  });

  final bool destructive;

  /// The action's words.
  final String label;

  /// Called when it is chosen; null disables it.
  final VoidCallback? onPressed;

  /// An icon before the words.
  final Widget? leadingIcon;

  /// An icon after the words and the shortcut.
  final Widget? trailingIcon;

  /// The action's keyboard shortcut, as the platform writes it (⌘C, Ctrl+C).
  final String? shortcut;

  /// Whether it is disabled: by a null [onPressed], as Flutter's own controls are, not a
  /// parameter of its own.
  bool get disabled => onPressed == null;

  /// Its states, where the caller keeps them.
  final WidgetStatesController? statesController;

  @override
  Widget build(BuildContext context) {
    final t = solarThemeOf(context);
    final p = SolarContextMenuItemProps(
      disabled: disabled || onPressed == null,
      destructive: destructive,
    );
    Widget draw(Set<WidgetState> states) => SolarLayers(
      recipe: SolarLayerRecipe(
        lookup: (c) => SolarContextMenuItemRecipe.lookup(c, p, states),
        dimension: (c) => SolarContextMenuItemRecipe.dimension(c, p, states),
        color: (c) => SolarContextMenuItemRecipe.color(t, c, p, states),
        shadow: (c) => SolarContextMenuItemRecipe.shadow(t, c, p, states),
        textStyle: (c) => SolarContextMenuItemRecipe.textStyle(t, c, p, states),
        present: (l) => switch (l) {
          'leadingIcon' => leadingIcon != null,
          'trailingIcon' => trailingIcon != null,
          'shortcut' => shortcut != null,
          _ => SolarContextMenuItemRecipe.present(l, p, states),
        },
        glyph: (_) => null,
      ),
      tree: SolarContextMenuItemRecipe.tree,
      keyPrefix: 'contextMenuItem',
      text: {'label': label, 'shortcut': ?shortcut},
      slots: {'leadingIcon': ?leadingIcon, 'trailingIcon': ?trailingIcon},
    ).layer('root');
    final mark = SolarPressable(
      onPressed: disabled ? null : onPressed,
      statesController: statesController,
      role: SolarMenuScope.of(context) ? SemanticsRole.menuItem : null,
      target: true,
      builder: (_, states) => draw(states),
    );
    return mark;
  }
}
