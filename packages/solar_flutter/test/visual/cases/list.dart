import 'package:flutter_test/flutter_test.dart';
import 'package:solar_flutter/solar_flutter.dart';

import '../harness.dart';
import '../layers.dart';

const listCase = VisualCase(build: buildList, measure: measureList);

/// The list's own layers, and each row and divider it holds by its layer, measured as their checks
/// measure one (layers.dart).
Layers measureList(WidgetTester tester) {
  final list = find.byType(SolarList);
  final own = measureLayers(tester, list, 'list');
  measureHeld(tester, list, own, const {
    'listItem': 'listItem',
    'divider': 'divider',
  });
  return own;
}
