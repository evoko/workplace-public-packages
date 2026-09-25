import 'package:flutter_test/flutter_test.dart';
import 'package:solar_flutter/solar_flutter.dart';

import '../harness.dart';
import '../layers.dart';

const calendarDayCellCase = VisualCase(
  build: buildCalendarDayCell,
  measure: measureCalendarDayCell,
);

/// The cell, its date's pill and its events' stack, as SolarLayers keyed them (layers.dart).
Layers measureCalendarDayCell(WidgetTester tester) =>
    measureLayers(tester, find.byType(SolarCalendarDayCell), 'calendarDayCell');
