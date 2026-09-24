import 'package:flutter_test/flutter_test.dart';
import 'package:solar_flutter/solar_flutter.dart';

import '../harness.dart';
import '../layers.dart';

const selectCase = VisualCase(build: buildSelect, measure: measureSelect);

/// The field and its parts, and the open panel with each row by its layer, as SolarLayers keyed
/// them (layers.dart), the rows measured as their own check measures one.
Layers measureSelect(WidgetTester tester) {
  final select = find.byWidgetPredicate((w) => w is SolarSelect);
  final own = measureLayers(tester, select, 'select');
  measureHeld(tester, select, own, const {'dropdownItem': 'dropdownItem'});
  return own;
}
