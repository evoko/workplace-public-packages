// Time Axis Label's Playground: an hour on a week or day grid's rail; its emphasis, density and
// words from their controls. As the web's (stories/playground/time-axis-label.tsx).

import 'package:solar_flutter/solar_flutter.dart';

import 'playground.dart';

final timeAxisLabelPlayground = SolarPlaygroundBuilder(
  build: (p) => SolarTimeAxisLabel(
    emphasis: p.choice('emphasis', SolarTimeAxisLabelEmphasis.values),
    density: p.choice('density', SolarTimeAxisLabelDensity.values),
    label: p.text('label'),
  ),
);
