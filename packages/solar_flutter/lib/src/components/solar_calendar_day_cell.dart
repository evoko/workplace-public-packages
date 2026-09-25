/// SOLAR Calendar Day Cell.
///
/// Written by hand, and never regenerated; its layer tree is the IR's,
/// [SolarCalendarDayCellRecipe.tree]. What it looks like is not here. That is the recipe,
/// [SolarCalendarDayCellRecipe]: the cell, its date's pill and text style, and its looks by state,
/// read cell by cell.
///
/// One day of a calendar's month grid, as the description says, drawn from Figma's layer tree
/// with [SolarLayers]: its [day] (the day of the month) and the caller's Event Chips ([children])
/// stacked under it. [today] puts its date in a pill, [selected] fills it and says so,
/// [todayColumn] tints a day in today's column of a week, and [otherMonth] fades a day of the month
/// before or after. [semanticLabel] names the whole date for a screen reader. It fills its column;
/// its height is Figma's. A styled part: which day it is, its events, and what a tap on it does,
/// are the caller's.
library;

import 'package:flutter/material.dart';
import 'package:flutter/rendering.dart';

import '../generated/components/calendar_day_cell.dart';
import '../solar_layers.dart';
import 'solar_theme_of.dart';

class SolarCalendarDayCell extends StatelessWidget {
  const SolarCalendarDayCell({
    super.key,
    required this.day,
    this.today = false,
    this.selected = false,
    this.todayColumn = false,
    this.otherMonth = false,
    this.semanticLabel,
    this.children = const [],
  });

  /// The day of the month.
  final String day;

  final bool today;
  final bool selected;
  final bool todayColumn;
  final bool otherMonth;

  /// The whole date, for a screen reader.
  final String? semanticLabel;

  /// Its events: [SolarEventChip]s.
  final List<Widget> children;

  @override
  Widget build(BuildContext context) {
    final t = solarThemeOf(context);
    final p = SolarCalendarDayCellProps(
      today: today,
      selected: selected,
      todayColumn: todayColumn,
      otherMonth: otherMonth,
    );
    const states = <WidgetState>{};
    final cell = SolarLayers(
      recipe: SolarLayerRecipe(
        lookup: (c) => SolarCalendarDayCellRecipe.lookup(c, p, states),
        dimension: (c) => SolarCalendarDayCellRecipe.dimension(c, p, states),
        color: (c) => SolarCalendarDayCellRecipe.color(t, c, p, states),
        shadow: (c) => SolarCalendarDayCellRecipe.shadow(t, c, p, states),
        textStyle: (c) => SolarCalendarDayCellRecipe.textStyle(t, c, p, states),
        present: (l) => SolarCalendarDayCellRecipe.present(l, p, states),
        glyph: (_) => null,
      ),
      tree: SolarCalendarDayCellRecipe.tree,
      keyPrefix: 'calendarDayCell',
      text: {'day': day},
      content: {'events': children},
      builders: {
        // A day's rows are fixed: its events take the room its date leaves them, and those past it
        // are cut off at its edge, as a month grid's are (Figma's three sample chips need 122 of
        // its 120), not squeezed.
        'events': (layer) => Flexible(
          child: ClipRect(
            child: OverflowBox(
              alignment: Alignment.topCenter,
              maxHeight: double.infinity,
              fit: OverflowBoxFit.deferToChild,
              child: layer,
            ),
          ),
        ),
        // The whole date names the cell where it is given; its figure is then not read twice.
        if (semanticLabel != null)
          'day': (layer) => ExcludeSemantics(child: layer),
      },
    ).layer('root');
    return Semantics(
      container: true,
      selected: selected,
      label: semanticLabel,
      child: cell,
    );
  }
}
