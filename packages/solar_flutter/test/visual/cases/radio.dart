import 'package:flutter_test/flutter_test.dart';
import 'package:solar_flutter/solar_flutter.dart';

import '../harness.dart';
import '../layers.dart';

const radioCase = VisualCase(build: buildRadio, measure: measureRadio);

/// The ring and dot, as SolarLayers keyed them (layers.dart).
Layers measureRadio(WidgetTester tester) => measureLayers(
  tester,
  find.byWidgetPredicate((w) => w is SolarRadio),
  'radio',
);
