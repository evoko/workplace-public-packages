/// SOLAR Time Slot.
///
/// Written by hand, and never regenerated; its layer tree is the IR's, [SolarTimeSlotRecipe.tree].
/// What it looks like is not here. That is the recipe, [SolarTimeSlotRecipe]: the cell, its edges
/// and its dashed half-hour rule, by state and density, read cell by cell.
///
/// An empty cell of a week or day grid, as the description says, drawn from Figma's layer tree
/// with [SolarLayers]: edged on its top and left so the cells compose into a grid, its half-hour
/// rule across its middle, as tall as an hour's row by [density]. Hovered under a pointer, and
/// [selected] (the cell a tap creates an event in) with a focus-bound edge; [onPressed] is the
/// caller's. It fills its day's column. [semanticLabel] names its hour for a screen reader.
library;

import 'package:flutter/material.dart';

import '../generated/components/time_slot.dart';
import '../solar_layers.dart';
import '../solar_states.dart';
import 'solar_theme_of.dart';

class SolarTimeSlot extends StatelessWidget {
  const SolarTimeSlot({
    super.key,
    this.selected = false,
    this.density = SolarTimeSlotDensity.comfortable,
    this.onPressed,
    this.semanticLabel,
    this.statesController,
  });

  final bool selected;
  final SolarTimeSlotDensity density;

  /// Called when it is tapped (to create an event there); null draws it still.
  final VoidCallback? onPressed;

  /// Its hour and day, for a screen reader ("Monday 9 AM").
  final String? semanticLabel;

  /// Its states, where the caller keeps them.
  final WidgetStatesController? statesController;

  @override
  Widget build(BuildContext context) {
    final t = solarThemeOf(context);
    final p = SolarTimeSlotProps(selected: selected, density: density);
    Widget draw(Set<WidgetState> states) => SolarLayers(
      recipe: SolarLayerRecipe(
        lookup: (c) => SolarTimeSlotRecipe.lookup(c, p, states),
        dimension: (c) => SolarTimeSlotRecipe.dimension(c, p, states),
        color: (c) => SolarTimeSlotRecipe.color(t, c, p, states),
        shadow: (c) => SolarTimeSlotRecipe.shadow(t, c, p, states),
        textStyle: (c) => SolarTimeSlotRecipe.textStyle(t, c, p, states),
        present: (l) => SolarTimeSlotRecipe.present(l, p, states),
        glyph: (_) => null,
      ),
      tree: SolarTimeSlotRecipe.tree,
      keyPrefix: 'timeSlot',
    ).layer('root');
    final slot = SolarPressable(
      onPressed: onPressed,
      statesController: statesController,
      selected: selected,
      target: false,
      builder: (_, states) => draw(states),
    );
    return semanticLabel == null
        ? slot
        : Semantics(label: semanticLabel, child: slot);
  }
}
