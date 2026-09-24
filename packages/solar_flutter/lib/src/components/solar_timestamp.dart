/// SOLAR Timestamp.
///
/// Scaffolded once by `npm run solar:scaffold -- --flutter Timestamp` from
/// spec/components/timestamp.json, and owned by developers from then on: change it freely. What it
/// looks like is not here. That is the recipe, [SolarTimestampRecipe]: its text style and colour,
/// by size and emphasis, read cell by cell.
///
/// Bespoke: a time in words, drawn from Figma's layer tree with [SolarLayers]. The words are the
/// app's, formatted in the user's locale and timezone (relative, '2 min ago'; absolute, 'Apr 18,
/// 2026, 14:32'); [format] says which they are. For combined, [detail] is the absolute time the
/// words abbreviate, a tooltip, which a screen reader reads too.
library;

import 'package:flutter/material.dart';

import '../generated/components/timestamp.dart';
import '../solar_layers.dart';
import 'solar_theme_of.dart';

class SolarTimestamp extends StatelessWidget {
  const SolarTimestamp({
    super.key,
    this.format = SolarTimestampFormat.relative,
    this.size = SolarTimestampSize.sm,
    this.emphasis = SolarTimestampEmphasis.$default,
    required this.text,
    this.detail,
  });

  final SolarTimestampFormat format;
  final SolarTimestampSize size;
  final SolarTimestampEmphasis emphasis;

  /// The words for the time, which the app formats in the user's locale and timezone.
  final String text;

  /// For combined: the absolute time the words abbreviate, shown as a tooltip.
  final String? detail;

  /// Each layer's children, as Figma nests them.
  static const _tree = <String, List<String>>{
    'root': ['value'],
  };

  @override
  Widget build(BuildContext context) {
    final t = solarThemeOf(context);
    final p = SolarTimestampProps(
      format: format,
      size: size,
      emphasis: emphasis,
    );
    const states = <WidgetState>{};
    final mark = SolarLayers(
      recipe: SolarLayerRecipe(
        lookup: (c) => SolarTimestampRecipe.lookup(c, p, states),
        dimension: (c) => SolarTimestampRecipe.dimension(c, p, states),
        color: (c) => SolarTimestampRecipe.color(t, c, p, states),
        shadow: (c) => SolarTimestampRecipe.shadow(t, c, p, states),
        textStyle: (c) => SolarTimestampRecipe.textStyle(t, c, p, states),
        present: (l) => SolarTimestampRecipe.present(l, p, states),
        glyph: (_) => null,
      ),
      tree: _tree,
      keyPrefix: 'timestamp',
      text: {'value': text},
    ).layer('root');
    return detail == null ? mark : Tooltip(message: detail, child: mark);
  }
}
