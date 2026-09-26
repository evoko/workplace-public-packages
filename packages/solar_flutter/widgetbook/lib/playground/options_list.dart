// Options List's Playground: three sample checkbox rows (one kind of control a list), shown by the
// `content` toggle; which are checked the `checked` extra, their words comma-separated (each
// trimmed; words naming no row ignored), which a tap on a row sets, in the rows' order. The
// question they answer, read by a screen reader, is the `label` extra. As the web's
// (stories/playground/options-list.tsx).

import 'package:solar_flutter/solar_flutter.dart';

import 'playground.dart';
import 'samples.dart';

final optionsListPlayground = SolarPlaygroundBuilder(
  build: (p) {
    final checked = {
      for (final name in p.text('checked').split(',')) name.trim(),
    };
    return SolarOptionsList(
      label: p.text('label'),
      children: [
        if (p.flag('content'))
          for (final channel in sampleChannels)
            SolarOptionRow<String>(
              label: channel,
              checked: checked.contains(channel),
              onChanged: (on) {
                final next = [
                  for (final c in sampleChannels)
                    if (c == channel ? on : checked.contains(c)) c,
                ];
                p.set('checked', next.join(', '));
                p.log('onChanged', {channel: on});
              },
            ),
      ],
    );
  },
);
