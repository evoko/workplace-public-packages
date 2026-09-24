import 'package:flutter_test/flutter_test.dart';
import 'package:solar_flutter/solar_flutter.dart';

import '../harness.dart';
import '../layers.dart';

const datePickerOpenCase = VisualCase(
  build: buildDatePickerOpen,
  measure: measureDatePickerOpen,
);

/// The calendar and its parts, as SolarLayers keyed them (layers.dart), and each day by its layer,
/// measured as its own check measures one.
Layers measureDatePickerOpen(WidgetTester tester) {
  final calendar = find.byType(SolarDatePickerOpen);
  final own = measureLayers(tester, calendar, 'datePickerOpen');
  measureHeld(tester, calendar, own, const {
    'dayGridDayCell': 'datePickerDayCell',
    'containerDayGridDayCell': 'datePickerDayCell',
    'container2DayGridDayCell': 'datePickerDayCell',
  });
  return own;
}
