import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:solar_flutter/solar_flutter.dart';

import '../harness.dart';
import '../layers.dart';
import 'button.dart';

const emptyStateCase = VisualCase(
  build: buildEmptyState,
  measure: measureEmptyState,
);

/// The stack and its parts, as SolarLayers keyed them (layers.dart); its Button is measured as the
/// Button check measures one.
Layers measureEmptyState(WidgetTester tester) {
  final own = measureLayers(tester, find.byType(SolarEmptyState), 'emptyState');
  final at = find.byKey(const Key('emptyState.action'));
  own['action'] = at.evaluate().isEmpty
      ? {'drawn': false}
      : {'drawn': true, 'layers': measureButtonAt(tester, at)};
  return own;
}
