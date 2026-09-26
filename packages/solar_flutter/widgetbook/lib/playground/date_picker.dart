// DatePicker's Playground: its date the IR's `value`, `YYYY-MM-DD` (Figma's own words are one),
// which typing a date or picking a day sets, and clearing the words empties; words that are no date
// give no date (dates.dart), not a failure. The field writes the date as the locale does. Its
// label, helper, size and states from their controls, a cleared label or helper left out;
// mandatory while `required` holds any text. The date chosen (`onDateChanged`) and the words typed
// (`onChanged`) are logged. As the web's (stories/playground/date-picker.tsx).

import 'package:solar_flutter/solar_flutter.dart';

import 'dates.dart';
import 'playground.dart';

final datePickerPlayground = SolarPlaygroundBuilder(
  build: (p) => SolarDatePicker(
    size: p.choice('size', SolarDatePickerSize.values),
    enabled: !p.flag('disabled'),
    error: p.flag('error'),
    label: p.words('label'),
    mandatory: p.words('required') != null,
    helper: p.words('helper'),
    value: dateOf(p.text('value')),
    onDateChanged: (date) {
      final iso = date == null ? null : isoOf(date);
      p.set('value', iso ?? '');
      p.log('onDateChanged', iso);
    },
    onChanged: (words) => p.log('onChanged', words),
  ),
);
