import 'package:flutter_test/flutter_test.dart';
import 'package:solar_flutter/solar_flutter.dart';

import '../harness.dart';
import '../layers.dart';

const contextMenuItemCase = VisualCase(
  build: buildContextMenuItem,
  measure: measureContextMenuItem,
);

/// The row and its parts, as SolarLayers keyed them (layers.dart).
Layers measureContextMenuItem(WidgetTester tester) =>
    measureLayers(tester, find.byType(SolarContextMenuItem), 'contextMenuItem');
