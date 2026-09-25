import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:solar_flutter/solar_flutter.dart';

import '../harness.dart';
import '../layers.dart';
import 'button.dart';

const columnItemCase = VisualCase(
  build: buildColumnItem,
  measure: measureColumnItem,
);

/// The cell and its parts, as SolarLayers keyed them (layers.dart); what it holds is another SOLAR
/// component, measured as that component's check measures one (the Button's as its own).
Layers measureColumnItem(WidgetTester tester) {
  final own = measureLayers(tester, find.byType(SolarColumnItem), 'columnItem');
  final button = find.byKey(const Key('columnItem.button'));
  if (button.evaluate().isNotEmpty) {
    own['button'] = {'drawn': true, 'layers': measureButtonAt(tester, button)};
  }
  return own;
}
