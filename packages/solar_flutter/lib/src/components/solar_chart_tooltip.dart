/// SOLAR Chart Tooltip.
///
/// Written by hand, and never regenerated; its layer tree is the IR's,
/// [SolarChartTooltipRecipe.tree]. What it looks like is not here. That is the recipe,
/// [SolarChartTooltipRecipe]: the surface, its rows and its words' text styles, single or multi,
/// read cell by cell.
///
/// A chart's value on hover, as the description says, drawn from Figma's layer tree with
/// [SolarLayers]: the point's [title] and a row per series ([rows]), each Figma's dot in the
/// series' colour, its label and its value. Rows that name their series draw the multi tooltip, a
/// row each, their values at the end; one bare value the compact single one. The chart shows and
/// hides it.
library;

import 'package:flutter/material.dart';

import '../generated/components/chart_tooltip.dart';
import '../generated/components/statusindicator.dart';
import '../solar_layers.dart';
import 'solar_statusindicator.dart';
import 'solar_theme_of.dart';

/// One series at the point: its name (for several), its value, formatted, and its colour.
class SolarChartTooltipRow {
  const SolarChartTooltipRow({
    this.label,
    required this.value,
    required this.color,
  });

  final String? label;
  final String value;
  final Color color;
}

class SolarChartTooltip extends StatelessWidget {
  const SolarChartTooltip({super.key, required this.title, required this.rows});

  /// The point's title: its category or date ("Jan 2026").
  final String title;

  /// The series at the point, in the chart's order.
  final List<SolarChartTooltipRow> rows;

  @override
  Widget build(BuildContext context) {
    final t = solarThemeOf(context);
    // Its series follows from what it is given: rows that name their series are the multi one.
    final p = SolarChartTooltipProps(
      series: rows.any((r) => r.label != null)
          ? SolarChartTooltipSeries.multi
          : SolarChartTooltipSeries.single,
    );
    const states = <WidgetState>{};
    Widget dot(String layer, Color color) => SolarStatusIndicator(
      type: SolarStatusIndicatorType.values.byName(
        SolarChartTooltipRecipe.lookup(
          '$layer.variant.type',
          p,
          states,
        )!.substring(2),
      ),
      size: SolarStatusIndicatorSize.values.byName(
        SolarChartTooltipRecipe.lookup(
          '$layer.variant.size',
          p,
          states,
        )!.substring(2),
      ),
      restyle: {'root.background': color},
    );
    SolarLayers layers({
      required String keyPrefix,
      Map<String, String> text = const {},
      Map<String, Widget> composed = const {},
      Map<String, List<Widget>> content = const {},
    }) => SolarLayers(
      recipe: SolarLayerRecipe(
        lookup: (c) => SolarChartTooltipRecipe.lookup(c, p, states),
        dimension: (c) => SolarChartTooltipRecipe.dimension(c, p, states),
        color: (c) => SolarChartTooltipRecipe.color(t, c, p, states),
        shadow: (c) => SolarChartTooltipRecipe.shadow(t, c, p, states),
        textStyle: (c) => SolarChartTooltipRecipe.textStyle(t, c, p, states),
        present: (l) => SolarChartTooltipRecipe.present(l, p, states),
        glyph: (_) => null,
      ),
      tree: SolarChartTooltipRecipe.tree,
      keyPrefix: keyPrefix,
      text: text,
      composed: composed,
      content: content,
    );
    // The title, then one row per series, the first keyed as the layer, so a check measures it.
    final own = layers(keyPrefix: 'chartTooltip', text: {'title': title});
    return layers(
      keyPrefix: 'chartTooltip',
      content: {
        'root': [
          own.layer('title'),
          for (final (i, row) in rows.indexed)
            layers(
              keyPrefix: i == 0 ? 'chartTooltip' : 'chartTooltip#$i',
              text: {'frameValue': row.value, 'frameFrameLabel': ?row.label},
              // The dot of whichever row this series draws.
              composed: {
                for (final layer in ['swatch', 'rowSwatch'])
                  if (SolarChartTooltipRecipe.present(layer, p, states))
                    layer: dot(layer, row.color),
              },
            ).layer('frame'),
        ],
      },
    ).layer('root');
  }
}
