import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:solar_flutter/solar_flutter.dart';

import '../harness.dart';
import '../layers.dart';
import 'button.dart';

const insightRowCase = VisualCase(
  build: buildInsightRow,
  measure: measureInsightRow,
);

/// The row and its parts, as SolarLayers keyed them (layers.dart); its Button is measured as the
/// Button check measures one.
Layers measureInsightRow(WidgetTester tester) {
  final own = measureLayers(tester, find.byType(SolarInsightRow), 'insightRow');
  final at = find.byKey(const Key('insightRow.action'));
  own['action'] = at.evaluate().isEmpty
      ? {'drawn': false}
      : {'drawn': true, 'layers': measureButtonAt(tester, at)};
  return own;
}
