import 'package:flutter_test/flutter_test.dart';
import 'package:solar_flutter/solar_flutter.dart';

import '../harness.dart';
import '../layers.dart';

const contextMenuCase = VisualCase(
  build: buildContextMenu,
  measure: measureContextMenu,
);

/// The surface's own layers, and each row and divider it holds by its layer, measured as their
/// checks measure one (layers.dart).
Layers measureContextMenu(WidgetTester tester) {
  final menu = find.byType(SolarContextMenu);
  final own = measureLayers(tester, menu, 'contextMenu');
  measureHeld(tester, menu, own, const {
    'contextMenuItem': 'contextMenuItem',
    'divider': 'divider',
  });
  return own;
}
