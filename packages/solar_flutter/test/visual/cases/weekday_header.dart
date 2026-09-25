import 'package:flutter_test/flutter_test.dart';
import 'package:solar_flutter/solar_flutter.dart';

import '../harness.dart';
import '../layers.dart';

const weekdayHeaderCase = VisualCase(
  build: buildWeekdayHeader,
  measure: measureWeekdayHeader,
);

/// The header and its weekday, as SolarLayers keyed them (layers.dart).
Layers measureWeekdayHeader(WidgetTester tester) =>
    measureLayers(tester, find.byType(SolarWeekdayHeader), 'weekdayHeader');
