/// SOLAR Weekday Header.
///
/// Written by hand, and never regenerated; its layer tree is the IR's,
/// [SolarWeekdayHeaderRecipe.tree]. What it looks like is not here. That is the recipe,
/// [SolarWeekdayHeaderRecipe]: the header, its edge and its weekday's text style and colour, read
/// cell by cell.
///
/// A calendar grid's column header, as the description says, drawn from Figma's layer tree with
/// [SolarLayers]: its weekday ([label], "Mon"), today's tinted ([emphasis] today). It fills its
/// column. A styled part: which day it heads is the caller's.
library;

import 'package:flutter/material.dart';

import '../generated/components/weekday_header.dart';
import '../solar_layers.dart';
import 'solar_theme_of.dart';

class SolarWeekdayHeader extends StatelessWidget {
  const SolarWeekdayHeader({
    super.key,
    required this.label,
    this.emphasis = SolarWeekdayHeaderEmphasis.$default,
  });

  /// The weekday, in the caller's words ("Mon").
  final String label;

  final SolarWeekdayHeaderEmphasis emphasis;

  @override
  Widget build(BuildContext context) {
    final t = solarThemeOf(context);
    final p = SolarWeekdayHeaderProps(emphasis: emphasis);
    const states = <WidgetState>{};
    return Semantics(
      header: true,
      child: SolarLayers(
        recipe: SolarLayerRecipe(
          lookup: (c) => SolarWeekdayHeaderRecipe.lookup(c, p, states),
          dimension: (c) => SolarWeekdayHeaderRecipe.dimension(c, p, states),
          color: (c) => SolarWeekdayHeaderRecipe.color(t, c, p, states),
          shadow: (c) => SolarWeekdayHeaderRecipe.shadow(t, c, p, states),
          textStyle: (c) => SolarWeekdayHeaderRecipe.textStyle(t, c, p, states),
          present: (l) => SolarWeekdayHeaderRecipe.present(l, p, states),
          glyph: (_) => null,
        ),
        tree: SolarWeekdayHeaderRecipe.tree,
        keyPrefix: 'weekdayHeader',
        text: {'label': label},
      ).layer('root'),
    );
  }
}
