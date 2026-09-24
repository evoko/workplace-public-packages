import 'package:flutter_test/flutter_test.dart';
import 'package:solar_flutter/solar_flutter.dart';

import '../harness.dart';
import '../layers.dart';

const stepperIndicatorCase = VisualCase(
  build: buildStepperIndicator,
  measure: measureStepperIndicator,
);

/// Its layers, as SolarLayers keyed them (layers.dart).
Layers measureStepperIndicator(WidgetTester tester) => measureLayers(
  tester,
  find.byType(SolarStepperIndicator),
  'stepperIndicator',
);
