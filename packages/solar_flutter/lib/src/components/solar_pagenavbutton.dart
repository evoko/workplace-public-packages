/// SOLAR PageNavButton.
///
/// Written by hand, and never regenerated; its layer tree is the IR's,
/// [SolarPageNavButtonRecipe.tree]. What it looks like is not here. That is the recipe,
/// [SolarPageNavButtonRecipe]: the button’s fill, edge and ring by state, and its words’ and
/// arrow’s ink, read cell by cell.
///
/// Bespoke: the previous or next button of a SolarPageNavigator, drawn from Figma's layer tree with
/// [SolarLayers], pressable and focusable: its arrow before "Previous" or after "Next" ([label]
/// replaces the words, which SOLAR asks to keep), disabled at the ends of the sequence rather than
/// hidden. Its arrows are mirrored in a right-to-left layout.
library;

import 'package:flutter/material.dart';

import '../generated/components/pagenavbutton.dart';
import '../generated/icons.dart';
import '../solar_layers.dart';
import '../solar_states.dart';
import 'solar_theme_of.dart';

class SolarPageNavButton extends StatelessWidget {
  const SolarPageNavButton({
    super.key,
    this.direction = SolarPageNavButtonDirection.prev,
    required this.onPressed,
    this.label,
    this.statesController,
  });

  final SolarPageNavButtonDirection direction;

  /// Called when it is chosen; null disables it.
  final VoidCallback? onPressed;

  /// Its words, "Previous" or "Next" by its direction.
  final String? label;

  /// Whether it is disabled: by a null [onPressed], as Flutter's own controls are, not a
  /// parameter of its own.
  bool get disabled => onPressed == null;

  /// Its states, where the caller keeps them.
  final WidgetStatesController? statesController;

  @override
  Widget build(BuildContext context) {
    final t = solarThemeOf(context);
    final p = SolarPageNavButtonProps(direction: direction, disabled: disabled);
    Widget draw(Set<WidgetState> states) => SolarLayers(
      recipe: SolarLayerRecipe(
        lookup: (c) => SolarPageNavButtonRecipe.lookup(c, p, states),
        dimension: (c) => SolarPageNavButtonRecipe.dimension(c, p, states),
        color: (c) => SolarPageNavButtonRecipe.color(t, c, p, states),
        shadow: (c) => SolarPageNavButtonRecipe.shadow(t, c, p, states),
        textStyle: (c) => SolarPageNavButtonRecipe.textStyle(t, c, p, states),
        present: (l) => SolarPageNavButtonRecipe.present(l, p, states),
        glyph: (_) => null,
      ),
      tree: SolarPageNavButtonRecipe.tree,
      keyPrefix: 'pageNavButton',
      text: {
        'label':
            label ??
            (direction == SolarPageNavButtonDirection.next
                ? 'Next'
                : 'Previous'),
      },
      icons: const {
        'iconArrowLeft': SolarIcons.arrowLeftOutline,
        'iconArrowRight': SolarIcons.arrowRightOutline,
      },
    ).layer('root');
    final mark = SolarPressable(
      onPressed: disabled ? null : onPressed,
      statesController: statesController,
      target: true,
      builder: (_, states) => draw(states),
    );
    return Directionality.of(context) == TextDirection.rtl
        ? Transform.flip(flipX: true, child: mark)
        : mark;
  }
}
