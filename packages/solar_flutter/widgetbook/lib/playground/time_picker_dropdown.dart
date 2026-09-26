// TimePicker Dropdown's Playground: the list of times, every 30 minutes, in place; its size from
// its control. The time chosen is the `value` extra, `HH:MM` on the 24-hour clock, which choosing a
// row sets; words that are no time choose none (dates.dart). The `content` toggle shows the times:
// off, the list offers none (a range that holds no time), as an app's with nothing left to offer.
// As the web's (stories/playground/time-picker-dropdown.tsx).

import 'package:flutter/material.dart';
import 'package:solar_flutter/solar_flutter.dart';

import 'dates.dart';
import 'playground.dart';

final timePickerDropdownPlayground = SolarPlaygroundBuilder(
  build: (p) {
    final content = p.flag('content');
    return SolarTimePickerDropdown(
      size: p.choice('size', SolarTimePickerDropdownSize.values),
      value: timeOf(p.text('value')),
      // A range that ends before it starts, where the content is hidden: no time.
      first: content ? null : const TimeOfDay(hour: 23, minute: 59),
      last: content ? null : const TimeOfDay(hour: 0, minute: 0),
      onChanged: (time) {
        p.set('value', hhmmOf(time));
        p.log('onChanged', hhmmOf(time));
      },
    );
  },
);
