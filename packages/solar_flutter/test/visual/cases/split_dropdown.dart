import 'package:flutter_test/flutter_test.dart';
import 'package:solar_flutter/solar_flutter.dart';

import '../harness.dart';
import '../layers.dart';

const splitDropdownCase = VisualCase(
  build: buildSplitDropdown,
  measure: measureSplitDropdown,
);

/// The box and its two zones, as SolarLayers keyed them (layers.dart).
Layers measureSplitDropdown(WidgetTester tester) =>
    measureLayers(tester, find.byType(SolarSplitDropdown), 'splitDropdown');
