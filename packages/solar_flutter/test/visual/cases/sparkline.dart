import 'package:flutter_test/flutter_test.dart';
import 'package:solar_flutter/solar_flutter.dart';

import '../harness.dart';
import '../layers.dart';

const sparklineCase = VisualCase(
  build: buildSparkline,
  measure: measureSparkline,
);

/// The frame and its line, as SolarLayers keyed them (layers.dart).
Layers measureSparkline(WidgetTester tester) =>
    measureLayers(tester, find.byType(SolarSparkline), 'sparkline');
