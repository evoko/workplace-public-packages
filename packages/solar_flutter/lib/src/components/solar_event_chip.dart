/// SOLAR Event Chip.
///
/// Written by hand, and never regenerated; its layer tree is the IR's, [SolarEventChipRecipe.tree].
/// What it looks like is not here. That is the recipe, [SolarEventChipRecipe]: its category's
/// stripe or fill, and its words' text styles and colours, read cell by cell.
///
/// One event in a calendar (a Day Cell, a week or day grid, an Agenda Row), as the description
/// says, drawn from Figma's layer tree with [SolarLayers]: its [category]'s colour as a stripe
/// beside neutral words ([variant] subtle), a pale fill (tinted) or a full fill with inverse words
/// (solid); its [time] where given, a repeating event's icon ([repeating]), and its [title], on one
/// line, cut short at the chip's end. It fills the width it is given. A styled part: what the event
/// is, and what a tap on it does, are the caller's.
library;

import 'package:flutter/material.dart';

import '../generated/components/event_chip.dart';
import '../generated/icons.dart';
import '../solar_layers.dart';
import 'solar_theme_of.dart';

class SolarEventChip extends StatelessWidget {
  const SolarEventChip({
    super.key,
    required this.title,
    this.category = SolarEventChipCategory.red,
    this.variant = SolarEventChipVariant.subtle,
    this.time,
    this.repeating = false,
  });

  /// The event's title.
  final String title;

  final SolarEventChipCategory category;
  final SolarEventChipVariant variant;

  /// When it starts, in the caller's words ("9:00"); given, it is drawn before the title.
  final String? time;

  /// Whether the event repeats: its icon is drawn before the title.
  final bool repeating;

  @override
  Widget build(BuildContext context) {
    final t = solarThemeOf(context);
    final p = SolarEventChipProps(category: category, variant: variant);
    const states = <WidgetState>{};
    bool drawn(String l) => SolarEventChipRecipe.present(l, p, states);
    return SolarLayers(
      recipe: SolarLayerRecipe(
        lookup: (c) => SolarEventChipRecipe.lookup(c, p, states),
        dimension: (c) => SolarEventChipRecipe.dimension(c, p, states),
        color: (c) => SolarEventChipRecipe.color(t, c, p, states),
        shadow: (c) => SolarEventChipRecipe.shadow(t, c, p, states),
        textStyle: (c) => SolarEventChipRecipe.textStyle(t, c, p, states),
        // A part left out is not drawn.
        present: (l) => switch (l) {
          'time' => time != null,
          'repeating' => repeating,
          _ => drawn(l),
        },
        glyph: (_) => null,
      ),
      tree: SolarEventChipRecipe.tree,
      keyPrefix: 'eventChip',
      text: {'title': title, 'time': ?time},
      truncates: const {'title'},
      icons: const {'repeating': SolarIcons.repeatOutline},
      // The repeat icon says it repeats to a screen reader, as its look does.
      builders: {
        'repeating': (icon) => Semantics(label: 'Repeats', child: icon),
      },
    ).layer('root');
  }
}
