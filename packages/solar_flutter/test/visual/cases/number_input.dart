import 'package:flutter_test/flutter_test.dart';
import 'package:solar_flutter/solar_flutter.dart';

import '../harness.dart';
import '../layers.dart';

const numberInputCase = VisualCase(
  build: buildNumberInput,
  measure: measureNumberInput,
);

/// The label, the field, its number and steppers, and the helper, as SolarLayers keyed them
/// (layers.dart).
Layers measureNumberInput(WidgetTester tester) =>
    measureLayers(tester, find.byType(SolarNumberInput), 'numberInput');
