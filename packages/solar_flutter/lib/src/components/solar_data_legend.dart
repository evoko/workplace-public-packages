/// SOLAR Data Legend.
///
/// Written by hand, and never regenerated; its layer tree is the IR's, [SolarDataLegendRecipe.tree].
/// What it looks like is not here. That is the recipe, [SolarDataLegendRecipe]: the legend's row or
/// column, each item's, and its name's text style, read cell by cell.
///
/// A chart's legend, as the description says, drawn from Figma's layer tree with [SolarLayers]: one
/// item per series the caller gives ([items]), each Figma's dot (the xs StatusIndicator's shape and
/// edge) in the series' colour beside its label, in a row or a column ([direction]). The dots are
/// decorative, the names say the series.
library;

import 'package:flutter/material.dart';

import '../generated/components/data_legend.dart';
import '../generated/components/statusindicator.dart';
import '../solar_layers.dart';
import 'solar_statusindicator.dart';
import 'solar_theme_of.dart';

/// One series: its name and its colour (the chart's).
class SolarDataLegendItem {
  const SolarDataLegendItem({required this.label, required this.color});

  final String label;
  final Color color;
}

class SolarDataLegend extends StatelessWidget {
  const SolarDataLegend({
    super.key,
    required this.items,
    this.direction = SolarDataLegendDirection.horizontal,
  });

  /// The series, in the chart's order.
  final List<SolarDataLegendItem> items;

  final SolarDataLegendDirection direction;

  @override
  Widget build(BuildContext context) {
    final t = solarThemeOf(context);
    final p = SolarDataLegendProps(direction: direction);
    const states = <WidgetState>{};
    String variant(String axis) => SolarDataLegendRecipe.lookup(
      'swatch.variant.$axis',
      p,
      states,
    )!.substring(2);
    SolarLayers layers({
      required String keyPrefix,
      Map<String, String> text = const {},
      Map<String, Widget> composed = const {},
      Map<String, List<Widget>> content = const {},
    }) => SolarLayers(
      recipe: SolarLayerRecipe(
        lookup: (c) => SolarDataLegendRecipe.lookup(c, p, states),
        dimension: (c) => SolarDataLegendRecipe.dimension(c, p, states),
        color: (c) => SolarDataLegendRecipe.color(t, c, p, states),
        shadow: (c) => SolarDataLegendRecipe.shadow(t, c, p, states),
        textStyle: (c) => SolarDataLegendRecipe.textStyle(t, c, p, states),
        present: (l) => SolarDataLegendRecipe.present(l, p, states),
        glyph: (_) => null,
      ),
      tree: SolarDataLegendRecipe.tree,
      keyPrefix: keyPrefix,
      text: text,
      composed: composed,
      content: content,
    );
    // One item per series, the first keyed as the layer, so a check measures it.
    final drawn = [
      for (final (i, item) in items.indexed)
        layers(
          keyPrefix: i == 0 ? 'dataLegend' : 'dataLegend#$i',
          text: {'label': item.label},
          composed: {
            'swatch': SolarStatusIndicator(
              type: SolarStatusIndicatorType.values.byName(variant('type')),
              size: SolarStatusIndicatorSize.values.byName(variant('size')),
              restyle: {'root.background': item.color},
            ),
          },
        ).layer('item'),
    ];
    return layers(
      keyPrefix: 'dataLegend',
      content: {'root': drawn},
    ).layer('root');
  }
}
