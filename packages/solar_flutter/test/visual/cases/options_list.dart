import 'package:flutter_test/flutter_test.dart';
import 'package:solar_flutter/solar_flutter.dart';

import '../harness.dart';
import '../layers.dart';

const optionsListCase = VisualCase(
  build: buildOptionsList,
  measure: measureOptionsList,
);

/// The list's own layers, and each row it holds by its layer, measured as the row's check measures
/// one (layers.dart).
Layers measureOptionsList(WidgetTester tester) {
  final list = find.byType(SolarOptionsList);
  final own = measureLayers(tester, list, 'optionsList');
  measureHeld(tester, list, own, const {'optionRow': 'optionRow'});
  return own;
}
