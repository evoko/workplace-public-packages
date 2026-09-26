// Date Picker Open's Playground: the calendar, in place; its look (`inline`, `type`) from its
// controls. The day chosen is the `value` extra, `YYYY-MM-DD`, which picking a day sets; words that
// are no date choose none (dates.dart). The IR's `month`, a month's English name and year (`April
// 2026`, Figma's), is the month it opens on, opened again where the control changes; words that are
// no month open it on the chosen day's month. Its arrows turn the month within the calendar and do
// not reach `month`: the widget tells no one the month it shows. As the web's
// (stories/playground/date-picker-open.tsx).

import 'package:flutter/widgets.dart';
import 'package:solar_flutter/solar_flutter.dart';

import 'dates.dart';
import 'playground.dart';

final datePickerOpenPlayground = SolarPlaygroundBuilder(
  build: (p) {
    final month = monthOf(p.text('month'));
    return SolarDatePickerOpen(
      // Opened afresh on the month the control names: the widget reads it only as it is built.
      key: ValueKey(month),
      inline: p.flag('inline'),
      type: p.choice('type', SolarDatePickerOpenType.values),
      initialMonth: month,
      value: dateOf(p.text('value')),
      onChanged: (date) {
        p.set('value', isoOf(date));
        p.log('onChanged', isoOf(date));
      },
    );
  },
);
