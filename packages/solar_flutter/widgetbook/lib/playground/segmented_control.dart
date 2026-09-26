// Segmented Control's Playground: three sample segments of its size, the chosen one the `selected`
// extra, which choosing a segment sets; its label, helper and size from their controls, a cleared
// label or helper left out. Figma's `mandatory` is the star's text layer, so the group is mandatory
// while that control holds any text. The `track` toggle shows the segments, the track's content.
// As the web's (stories/playground/segmented-control.tsx).

import 'package:solar_flutter/solar_flutter.dart';

import 'playground.dart';

/// The sample segments, as the `selected` extra's dartOptions name them.
enum _Segment { day, week, month }

/// A segment's words, the `selected` extra's option at its index.
const _words = ['Day', 'Week', 'Month'];

final segmentedControlPlayground = SolarPlaygroundBuilder(
  build: (p) {
    final size = p.choice('size', SolarSegmentedControlSize.values);
    final itemSize = SolarSegmentedControlItemSize.values.byName(size.name);
    return SolarSegmentedControl<_Segment>(
      size: size,
      label: p.words('label'),
      mandatory: p.words('mandatory') != null,
      helper: p.words('helper'),
      groupValue: p.choice('selected', _Segment.values),
      onChanged: (value) {
        if (value == null) return;
        p.setChoice('selected', value);
        p.log('onChanged', _words[value.index]);
      },
      children: [
        if (p.flag('track'))
          for (final segment in _Segment.values)
            SolarSegmentedControlItem<_Segment>(
              value: segment,
              label: _words[segment.index],
              size: itemSize,
            ),
      ],
    );
  },
);
