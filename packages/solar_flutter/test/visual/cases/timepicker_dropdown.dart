import 'package:flutter_test/flutter_test.dart';
import 'package:solar_flutter/solar_flutter.dart';

import '../harness.dart';
import '../layers.dart';

const timePickerDropdownCase = VisualCase(
  build: buildTimePickerDropdown,
  measure: measureTimePickerDropdown,
);

/// The surface's own layers, and each row by its layer, measured as a row's check measures one
/// (layers.dart).
Layers measureTimePickerDropdown(WidgetTester tester) {
  final menu = find.byType(SolarTimePickerDropdown);
  final own = measureLayers(tester, menu, 'timePickerDropdown');
  measureHeld(tester, menu, own, const {'dropdownItem': 'dropdownItem'});
  return own;
}
