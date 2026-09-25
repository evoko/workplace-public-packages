/// SOLAR Time Axis Label.
///
/// Written by hand, and never regenerated; its layer tree is the IR's,
/// [SolarTimeAxisLabelRecipe.tree]. What it looks like is not here. That is the recipe,
/// [SolarTimeAxisLabelRecipe]: the rail's cell, its hour's text style and colour, by density, read
/// cell by cell.
///
/// An hour marker on the left rail of a week or day grid, as the description says, drawn from
/// Figma's layer tree with [SolarLayers]: its hour ([label], "9 AM"), at the top of its row, the
/// current hour's tinted and bolder ([emphasis] now); as tall as its hour's row, by [density]. A
/// styled part: which hour it marks is the caller's.
library;

import 'package:flutter/material.dart';

import '../generated/components/time_axis_label.dart';
import '../solar_layers.dart';
import 'solar_theme_of.dart';

class SolarTimeAxisLabel extends StatelessWidget {
  const SolarTimeAxisLabel({
    super.key,
    required this.label,
    this.emphasis = SolarTimeAxisLabelEmphasis.$default,
    this.density = SolarTimeAxisLabelDensity.comfortable,
  });

  /// The hour, in the caller's words ("9 AM").
  final String label;

  final SolarTimeAxisLabelEmphasis emphasis;
  final SolarTimeAxisLabelDensity density;

  @override
  Widget build(BuildContext context) {
    final t = solarThemeOf(context);
    final p = SolarTimeAxisLabelProps(emphasis: emphasis, density: density);
    const states = <WidgetState>{};
    return Semantics(
      header: true,
      child: SolarLayers(
        recipe: SolarLayerRecipe(
          lookup: (c) => SolarTimeAxisLabelRecipe.lookup(c, p, states),
          dimension: (c) => SolarTimeAxisLabelRecipe.dimension(c, p, states),
          color: (c) => SolarTimeAxisLabelRecipe.color(t, c, p, states),
          shadow: (c) => SolarTimeAxisLabelRecipe.shadow(t, c, p, states),
          textStyle: (c) => SolarTimeAxisLabelRecipe.textStyle(t, c, p, states),
          present: (l) => SolarTimeAxisLabelRecipe.present(l, p, states),
          glyph: (_) => null,
        ),
        tree: SolarTimeAxisLabelRecipe.tree,
        keyPrefix: 'timeAxisLabel',
        text: {'label': label},
      ).layer('root'),
    );
  }
}
