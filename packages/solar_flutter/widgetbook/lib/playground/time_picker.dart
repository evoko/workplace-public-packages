// TimePicker's Playground: its time the IR's `value`, which typing a time or picking one sets, as
// `HH:MM` on the 24-hour clock, and clearing the words empties; the control also reads Figma's own
// words, `12:00 AM`, on the 12-hour clock (dates.dart), and words that are no time give no time,
// not a failure. The field writes the time on the platform's clock. Its label, helper, size and
// states from their controls, a cleared label or helper left out; mandatory while `required` holds
// any text. The time chosen (`onTimeChanged`) and the words typed (`onChanged`) are logged. As the
// web's (stories/playground/time-picker.tsx).

import 'package:solar_flutter/solar_flutter.dart';

import 'dates.dart';
import 'playground.dart';

final timePickerPlayground = SolarPlaygroundBuilder(
  build: (p) => SolarTimePicker(
    size: p.choice('size', SolarTimePickerSize.values),
    enabled: !p.flag('disabled'),
    error: p.flag('error'),
    label: p.words('label'),
    mandatory: p.words('required') != null,
    helper: p.words('helper'),
    value: timeOf(p.text('value')),
    onTimeChanged: (time) {
      final hhmm = time == null ? null : hhmmOf(time);
      p.set('value', hhmm ?? '');
      p.log('onTimeChanged', hhmm);
    },
    onChanged: (words) => p.log('onChanged', words),
  ),
);
