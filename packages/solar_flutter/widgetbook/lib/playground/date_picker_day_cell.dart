// Date Picker Day Cell's Playground: one day, named by its whole date (a sample April 2026 one). Its
// words, states and range role from their controls. A tap chooses it, as the calendar's day is
// chosen: it is logged, and sets `selected`. Disabled (a null onPressed), it is inert. As the web's
// (stories/playground/date-picker-day-cell.tsx), which draws it in a grid's row, a cell's place on
// the web.

import 'package:solar_flutter/solar_flutter.dart';

import 'playground.dart';

final datePickerDayCellPlayground = SolarPlaygroundBuilder(
  build: (p) {
    final day = p.text('day');
    return SolarDatePickerDayCell(
      selected: p.flag('selected'),
      today: p.flag('today'),
      filled: p.flag('filled'),
      error: p.flag('error'),
      rangeRole: p.choice('rangeRole', SolarDatePickerDayCellRangeRole.values),
      label: day,
      semanticLabel: '$day April 2026',
      onPressed: p.flag('disabled')
          ? null
          : () {
              p.set('selected', true);
              p.log('onPressed', day);
            },
    );
  },
);
