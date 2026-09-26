// Weekday Header's Playground: a calendar grid's column header; its emphasis and words from their
// controls. As the web's (stories/playground/weekday-header.tsx).

import 'package:solar_flutter/solar_flutter.dart';

import 'playground.dart';

final weekdayHeaderPlayground = SolarPlaygroundBuilder(
  build: (p) => SolarWeekdayHeader(
    emphasis: p.choice('emphasis', SolarWeekdayHeaderEmphasis.values),
    label: p.text('label'),
  ),
);
