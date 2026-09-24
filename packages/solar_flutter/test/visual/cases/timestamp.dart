import 'package:flutter_test/flutter_test.dart';
import 'package:solar_flutter/solar_flutter.dart';

import '../harness.dart';
import '../layers.dart';

const timestampCase = VisualCase(
  build: buildTimestamp,
  measure: measureTimestamp,
);

/// The line and its words, as SolarLayers keyed them (layers.dart).
Layers measureTimestamp(WidgetTester tester) =>
    measureLayers(tester, find.byType(SolarTimestamp), 'timestamp');
