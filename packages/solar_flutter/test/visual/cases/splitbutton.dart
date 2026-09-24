import 'package:flutter_test/flutter_test.dart';
import 'package:solar_flutter/solar_flutter.dart';

import '../harness.dart';
import '../layers.dart';
import 'spinner.dart';

const splitButtonCase = VisualCase(
  build: buildSplitButton,
  measure: measureSplitButton,
);

/// The control and its halves, as SolarLayers keyed them (layers.dart), and the loading Spinner,
/// a composed child checked against its own oracle.
Layers measureSplitButton(WidgetTester tester) {
  final at = find.byType(SolarSplitButton);
  final spinners = find.descendant(of: at, matching: find.byType(SolarSpinner));
  return {
    ...measureLayers(tester, at, 'splitButton'),
    'spinner': spinners.evaluate().isEmpty
        ? {'drawn': false}
        : {'drawn': true, 'layers': spinnerLayers(tester, spinners)},
  };
}
