import 'package:flutter_test/flutter_test.dart';
import 'package:solar_flutter/solar_flutter.dart';

import '../harness.dart';
import '../layers.dart';

const datePickerCase = VisualCase(
  build: buildDatePicker,
  measure: measureDatePicker,
);

/// The label, the field, its words and calendar icon, and the helper, as SolarLayers keyed them
/// (layers.dart); the words in the style the TextField paints them in.
Layers measureDatePicker(WidgetTester tester) =>
    measureLayers(tester, find.byType(SolarDatePicker), 'datePicker');
