import 'package:flutter_test/flutter_test.dart';
import 'package:solar_flutter/solar_flutter.dart';

import '../harness.dart';
import '../layers.dart';

const dropdownMenuCase = VisualCase(
  build: buildDropdownMenu,
  measure: measureDropdownMenu,
);

/// The surface's own layers, and each row and heading it holds by its layer, measured as their
/// checks measure one (layers.dart).
Layers measureDropdownMenu(WidgetTester tester) {
  final menu = find.byType(SolarDropdownMenu);
  final own = measureLayers(tester, menu, 'dropdownMenu');
  measureHeld(tester, menu, own, const {
    'dropdownItem': 'dropdownItem',
    'dropdownGroupLabel': 'dropdownGroupLabel',
  });
  return own;
}
