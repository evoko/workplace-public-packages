/// SOLAR Stepper Indicator.
///
/// Written by hand, and never regenerated; its layer tree is the IR's,
/// [SolarStepperIndicatorRecipe.tree]. What it looks like is not here. That is the recipe,
/// [SolarStepperIndicatorRecipe]: the circle’s fill and edge by status, and its mark’s ink, read
/// cell by cell.
///
/// Bespoke: the circle of one step's status, drawn from Figma's layer tree with [SolarLayers]: a
/// tick when completed, the step's [number] when active or upcoming, a "!" in error. A part of a
/// SolarStep, which names the step: excluded from semantics.
library;

import 'package:flutter/material.dart';

import '../generated/components/stepper_indicator.dart';
import '../generated/icons.dart';
import '../solar_layers.dart';
import 'solar_theme_of.dart';

class SolarStepperIndicator extends StatelessWidget {
  const SolarStepperIndicator({
    super.key,
    this.status = SolarStepperIndicatorStatus.completed,
    required this.number,
  });

  final SolarStepperIndicatorStatus status;

  /// The step's number, from 1.
  final int number;

  @override
  Widget build(BuildContext context) {
    final t = solarThemeOf(context);
    final p = SolarStepperIndicatorProps(status: status);
    const states = <WidgetState>{};
    final mark = SolarLayers(
      recipe: SolarLayerRecipe(
        lookup: (c) => SolarStepperIndicatorRecipe.lookup(c, p, states),
        dimension: (c) => SolarStepperIndicatorRecipe.dimension(c, p, states),
        color: (c) => SolarStepperIndicatorRecipe.color(t, c, p, states),
        shadow: (c) => SolarStepperIndicatorRecipe.shadow(t, c, p, states),
        textStyle: (c) =>
            SolarStepperIndicatorRecipe.textStyle(t, c, p, states),
        present: (l) => SolarStepperIndicatorRecipe.present(l, p, states),
        glyph: (_) => null,
      ),
      tree: SolarStepperIndicatorRecipe.tree,
      keyPrefix: 'stepperIndicator',
      text: {'number': '$number', 'icon': '!'},
      icons: const {'iconCheck': SolarIcons.checkOutline},
    ).layer('root');
    return ExcludeSemantics(child: mark);
  }
}
