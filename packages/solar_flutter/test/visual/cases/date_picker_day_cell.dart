import 'package:flutter_test/flutter_test.dart';
import 'package:solar_flutter/solar_flutter.dart';

import '../harness.dart';
import '../layers.dart';

const datePickerDayCellCase = VisualCase(
  build: buildDatePickerDayCell,
  measure: measureDatePickerDayCell,
);

/// The day and its words, as SolarLayers keyed them (layers.dart).
Layers measureDatePickerDayCell(WidgetTester tester) => measureLayers(
  tester,
  find.byType(SolarDatePickerDayCell),
  'datePickerDayCell',
);
