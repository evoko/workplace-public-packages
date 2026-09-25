/// SOLAR Option Card.
///
/// Written by hand, and never regenerated; its layer tree is the IR's,
/// [SolarOptionCardRecipe.tree]. What it looks like is not here. That is the recipe,
/// [SolarOptionCardRecipe]: the tile’s edge, shadow and focus ring by state, the Plus’s circle and
/// ink, and its label, read cell by cell.
///
/// A tile to create something new, in a grid of them (“New design”): a Plus in a circle over its
/// [label]. Given [onPressed], it is pressable: its label is the button or link, and its hit area
/// the whole tile; it is hovered and focused only then. The [selected] one is the current one of
/// its set. Drawn from Figma's layer tree with [SolarLayers]; pressable, the whole card is its
/// button, named by its label, and its own controls are controls of their own inside it.
library;

import 'package:flutter/material.dart';

import '../generated/components/option_card.dart';
import '../generated/icons.dart';
import '../solar_layers.dart';
import '../solar_states.dart';
import 'solar_theme_of.dart';

class SolarOptionCard extends StatelessWidget {
  const SolarOptionCard({
    super.key,
    required this.label,
    this.selected = false,

    this.onPressed,
    this.statesController,
  });

  final bool selected;

  /// What it creates, in a few words; its action’s name where it is pressable.
  final String label;

  /// Makes it pressable: the whole card is a button that calls it.
  final VoidCallback? onPressed;

  /// Its states, where the caller keeps them.
  final WidgetStatesController? statesController;

  @override
  Widget build(BuildContext context) {
    final t = solarThemeOf(context);
    final p = SolarOptionCardProps(selected: selected);
    final pressable = onPressed != null;
    Widget draw(Set<WidgetState> states) {
      final recipe = SolarLayerRecipe(
        lookup: (c) => SolarOptionCardRecipe.lookup(c, p, states),
        dimension: (c) => SolarOptionCardRecipe.dimension(c, p, states),
        color: (c) => SolarOptionCardRecipe.color(t, c, p, states),
        shadow: (c) => SolarOptionCardRecipe.shadow(t, c, p, states),
        textStyle: (c) => SolarOptionCardRecipe.textStyle(t, c, p, states),
        // A slot left empty is not drawn.
        present: (l) => switch (l) {
          _ => SolarOptionCardRecipe.present(l, p, states),
        },
        glyph: (_) => null,
      );
      SolarLayers layers(Map<String, List<Widget>> content) => SolarLayers(
        recipe: recipe,
        tree: SolarOptionCardRecipe.tree,
        keyPrefix: 'optionCard',
        text: {'label': label},
        wraps: const {'label': TextAlign.center},
        icons: const {'iconPlus': SolarIcons.plusOutline},
        content: content,
      );
      return layers(const {}).layer('root');
    }

    final Widget mark = pressable
        ? SolarPressable(
            onPressed: onPressed,
            statesController: statesController,
            selected: selected,
            builder: (_, states) =>
                draw({...states, if (selected) WidgetState.selected}),
          )
        : draw({if (selected) WidgetState.selected});
    return Semantics(container: true, child: mark);
  }
}
