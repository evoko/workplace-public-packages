/// SOLAR Agenda Row.
///
/// Written by hand, and never regenerated; its layer tree is the IR's, [SolarAgendaRowRecipe.tree].
/// What it looks like is not here. That is the recipe, [SolarAgendaRowRecipe]: the row, its edge,
/// its words' text styles and its dot, by state and density, read cell by cell.
///
/// One event in the Agenda view, as the description says, a denser alternative to a
/// [SolarCalendarDayCell], drawn from Figma's layer tree with [SolarLayers]. At the comfortable
/// [density]: its [start] above its [end], a dot in the event's [color], its [title], a line of
/// words about it ([meta]) and an [attendee] (a [SolarAvatar]). At compact: one time [range]
/// ("9:00 – 10:00", [start] and [end] joined where none is given) and its title. Given
/// [onPressed], it is a button, hovered under a pointer and [selected] as the one the caller shows.
/// It fills its list. A styled part: the event, its words and what a tap does are the caller's.
library;

import 'package:flutter/material.dart';

import '../generated/components/agenda_row.dart';
import '../solar_layers.dart';
import '../solar_states.dart';
import 'solar_theme_of.dart';

class SolarAgendaRow extends StatelessWidget {
  const SolarAgendaRow({
    super.key,
    required this.title,
    this.start,
    this.end,
    this.range,
    this.meta,
    this.attendee,
    this.color,
    this.selected = false,
    this.density = SolarAgendaRowDensity.comfortable,
    this.onPressed,
    this.statesController,
  });

  /// The event's title.
  final String title;

  /// When it starts ("9:00").
  final String? start;

  /// When it ends ("10:00").
  final String? end;

  /// The compact row's one time range; [start] and [end] joined where none is given.
  final String? range;

  /// A line of words about it ("Conference room A · 6 attendees").
  final String? meta;

  /// An attendee: a [SolarAvatar] (md).
  final Widget? attendee;

  /// The event's colour, its dot's; Figma's category 06 where none is given.
  final Color? color;

  final bool selected;
  final SolarAgendaRowDensity density;

  /// Called when it is tapped; null draws it still.
  final VoidCallback? onPressed;

  /// Its states, where the caller keeps them.
  final WidgetStatesController? statesController;

  @override
  Widget build(BuildContext context) {
    final t = solarThemeOf(context);
    final p = SolarAgendaRowProps(
      selected: selected,
      density: density,
      color: color,
    );
    final joined =
        range ?? (start != null && end != null ? '$start – $end' : start);
    Widget draw(Set<WidgetState> states) {
      bool drawn(String l) => SolarAgendaRowRecipe.present(l, p, states);
      return SolarLayers(
        recipe: SolarLayerRecipe(
          lookup: (c) => SolarAgendaRowRecipe.lookup(c, p, states),
          dimension: (c) => SolarAgendaRowRecipe.dimension(c, p, states),
          color: (c) => switch (c) {
            'dot.background' when color != null => color!,
            _ => SolarAgendaRowRecipe.color(t, c, p, states),
          },
          shadow: (c) => SolarAgendaRowRecipe.shadow(t, c, p, states),
          textStyle: (c) => SolarAgendaRowRecipe.textStyle(t, c, p, states),
          // A part left out is not drawn.
          present: (l) => switch (l) {
            'start' => start != null && drawn(l),
            'end' => end != null && drawn(l),
            'range' => joined != null && drawn(l),
            'meta' => meta != null && drawn(l),
            'attendee' => attendee != null && drawn(l),
            _ => drawn(l),
          },
          glyph: (_) => null,
        ),
        tree: SolarAgendaRowRecipe.tree,
        keyPrefix: 'agendaRow',
        text: {
          'title': title,
          'start': ?start,
          'end': ?end,
          'range': ?joined,
          'meta': ?meta,
        },
        truncates: const {'title', 'meta'},
        composed: {'attendee': ?attendee},
      ).layer('root');
    }

    return SolarPressable(
      onPressed: onPressed,
      statesController: statesController,
      selected: selected,
      target: false,
      builder: (_, states) => draw(states),
    );
  }
}
