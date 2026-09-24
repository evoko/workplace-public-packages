import 'package:flutter_test/flutter_test.dart';
import 'package:solar_flutter/solar_flutter.dart';

import '../harness.dart';
import '../layers.dart';

const stepperCase = VisualCase(build: buildStepper, measure: measureStepper);

/// The stepper and its parts, each in the layer Figma draws for its status, as SolarLayers keyed
/// them (layers.dart); its Steps and Stepper Indicators measured as their own checks measure one.
Layers measureStepper(WidgetTester tester) =>
    measureLayers(tester, find.byType(SolarStepper), 'stepper');
