// Calendar Day Cell's Playground: one day of a month's grid, named by its whole date (a sample
// October 2026 one). Its day and states from their controls; its events, three sample Event Chips
// (samples.dart), shown by the `events` toggle. A styled part: which day is selected is the app's,
// from the `selected` control. As the web's (stories/playground/calendar-day-cell.tsx), which draws
// it in a grid's row, a cell's place on the web.

import 'package:solar_flutter/solar_flutter.dart';

import 'playground.dart';
import 'samples.dart';

final calendarDayCellPlayground = SolarPlaygroundBuilder(
  build: (p) {
    final day = p.text('day');
    return SolarCalendarDayCell(
      day: day,
      semanticLabel: '$day October 2026',
      otherMonth: p.flag('otherMonth'),
      selected: p.flag('selected'),
      today: p.flag('today'),
      todayColumn: p.flag('todayColumn'),
      children: [
        if (p.flag('events'))
          for (final (title, time, category) in sampleEvents)
            SolarEventChip(category: category, time: time, title: title),
      ],
    );
  },
);
