import 'package:flutter_test/flutter_test.dart';
import 'package:solar_flutter/solar_flutter.dart';

import '../harness.dart';
import '../layers.dart';

const timePickerCase = VisualCase(
  build: buildTimePicker,
  measure: measureTimePicker,
);

/// The label, the field, its words and clock icon, and the helper, as SolarLayers keyed them
/// (layers.dart); the words in the style the TextField paints them in.
Layers measureTimePicker(WidgetTester tester) =>
    measureLayers(tester, find.byType(SolarTimePicker), 'timePicker');
