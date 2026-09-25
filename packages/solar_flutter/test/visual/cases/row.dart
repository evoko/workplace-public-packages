import 'package:flutter_test/flutter_test.dart';
import 'package:solar_flutter/solar_flutter.dart';

import '../harness.dart';
import '../layers.dart';

const rowCase = VisualCase(build: buildRow, measure: measureRow);

/// The row and its parts, as SolarLayers keyed them (layers.dart); its select and expand cells and
/// its first cell measured as their own checks measure one.
Layers measureRow(WidgetTester tester) {
  final row = find.byType(SolarRow);
  final own = measureLayers(tester, row, 'row');
  measureHeld(tester, row, own, const {'columnItem': 'columnItem'});
  return own;
}
