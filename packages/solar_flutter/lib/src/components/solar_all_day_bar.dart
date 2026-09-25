/// SOLAR All-Day Bar.
///
/// Written by hand, and never regenerated; its layer tree is the IR's, [SolarAllDayBarRecipe.tree].
/// What it looks like is not here. That is the recipe, [SolarAllDayBarRecipe]: its stripe or fill,
/// and its words' text styles and colours, read cell by cell.
///
/// An event that spans a day or more, as the description says, drawn from Figma's layer tree with
/// [SolarLayers]: a bar in a week or day grid's all-day row, or across a month grid's columns, as a
/// stripe beside neutral words ([variant] subtle) or a full fill with inverse words (solid); its
/// [time] where given ("All day") and its [title], on one line, cut short at the bar's end. [span]
/// says which segment of a bar across columns it is. It fills the columns it spans. A styled part:
/// what the event is, and what a tap on it does, are the caller's.
library;

import 'package:flutter/material.dart';

import '../generated/components/all_day_bar.dart';
import '../solar_layers.dart';
import 'solar_theme_of.dart';

class SolarAllDayBar extends StatelessWidget {
  const SolarAllDayBar({
    super.key,
    required this.title,
    this.time,
    this.variant = SolarAllDayBarVariant.subtle,
    this.span = SolarAllDayBarSpan.single,
    this.category = SolarAllDayBarCategory.blue,
  });

  /// The event's title.
  final String title;

  /// When it is, in the caller's words ("All day"); given, it is drawn before the title.
  final String? time;

  final SolarAllDayBarVariant variant;
  final SolarAllDayBarSpan span;

  /// Its event's category, its stripe's or fill's colour, as an Event Chip's.
  final SolarAllDayBarCategory category;

  @override
  Widget build(BuildContext context) {
    final t = solarThemeOf(context);
    final p = SolarAllDayBarProps(
      variant: variant,
      span: span,
      category: category,
    );
    const states = <WidgetState>{};
    return SolarLayers(
      recipe: SolarLayerRecipe(
        lookup: (c) => SolarAllDayBarRecipe.lookup(c, p, states),
        dimension: (c) => SolarAllDayBarRecipe.dimension(c, p, states),
        color: (c) => SolarAllDayBarRecipe.color(t, c, p, states),
        shadow: (c) => SolarAllDayBarRecipe.shadow(t, c, p, states),
        textStyle: (c) => SolarAllDayBarRecipe.textStyle(t, c, p, states),
        // A part left out is not drawn.
        present: (l) => switch (l) {
          'time' => time != null,
          _ => SolarAllDayBarRecipe.present(l, p, states),
        },
        glyph: (_) => null,
      ),
      tree: SolarAllDayBarRecipe.tree,
      keyPrefix: 'allDayBar',
      text: {'title': title, 'time': ?time},
      truncates: const {'title'},
    ).layer('root');
  }
}
