import 'package:flutter_test/flutter_test.dart';
import 'package:solar_flutter/solar_flutter.dart';

import '../harness.dart';
import '../layers.dart';

const timeAxisLabelCase = VisualCase(
  build: buildTimeAxisLabel,
  measure: measureTimeAxisLabel,
);

/// The rail's cell and its hour, as SolarLayers keyed them (layers.dart).
Layers measureTimeAxisLabel(WidgetTester tester) =>
    measureLayers(tester, find.byType(SolarTimeAxisLabel), 'timeAxisLabel');
