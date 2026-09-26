// Stepper Indicator's Playground: its status from its control, its number the `number` extra. As the
// web's (stories/playground/stepper-indicator.tsx).

import 'package:solar_flutter/solar_flutter.dart';

import 'playground.dart';

final stepperIndicatorPlayground = SolarPlaygroundBuilder(
  build: (p) => SolarStepperIndicator(
    status: p.choice('status', SolarStepperIndicatorStatus.values),
    number: p.whole('number'),
  ),
);
