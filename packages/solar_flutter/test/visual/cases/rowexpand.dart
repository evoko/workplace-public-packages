import 'package:flutter_test/flutter_test.dart';
import 'package:solar_flutter/solar_flutter.dart';

import '../harness.dart';
import '../layers.dart';

const rowExpandCase = VisualCase(
  build: buildRowExpand,
  measure: measureRowExpand,
);

/// The cell, its chevron and its connector, as SolarLayers keyed them (layers.dart).
Layers measureRowExpand(WidgetTester tester) =>
    measureLayers(tester, find.byType(SolarRowExpand), 'rowExpand');
