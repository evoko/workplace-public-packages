// Bar Stack's Playground: its orientation from its control; its segments' shares the `segments`
// extra, numbers comma-separated (words that are no number, and shares not above 0, ignored), each
// in Figma's sample colours in turn. A stack fills the box its chart gives it, so it is drawn in a
// box of the `length` and `thickness` extras, along its orientation (Figma's 32 × 80 at first): the
// chart's data, not the stack's design. As the web's (stories/playground/bar-stack.tsx).

import 'package:flutter/widgets.dart';
import 'package:solar_flutter/solar_flutter.dart';

import 'charts.dart';
import 'playground.dart';

/// Figma's sample breakdown's colours, first to last.
const _colors = [
  SolarBarColor.feedbackDangerStrong,
  SolarBarColor.feedbackWarningMedium,
  SolarBarColor.feedbackInfoMedium,
  SolarBarColor.feedbackNeutralSubtle,
];

final barStackPlayground = SolarPlaygroundBuilder(
  build: (p) {
    final orientation = p.choice(
      'orientation',
      SolarBarStackOrientation.values,
    );
    final length = p.whole('length').toDouble();
    final thickness = p.whole('thickness').toDouble();
    final across = orientation == SolarBarStackOrientation.horizontal;
    final shares = numbersIn(p.text('segments')).where((v) => v > 0);
    return SizedBox(
      width: across ? length : thickness,
      height: across ? thickness : length,
      child: SolarBarStack(
        orientation: orientation,
        segments: [
          for (final (i, value) in shares.indexed)
            SolarBarStackSegment(
              value: value,
              color: _colors[i % _colors.length],
            ),
        ],
      ),
    );
  },
);
