import 'package:flutter_test/flutter_test.dart';
import 'package:solar_flutter/solar_flutter.dart';

import '../harness.dart';
import '../layers.dart';

const sectionNavItemCase = VisualCase(
  build: buildSectionNavItem,
  measure: measureSectionNavItem,
);

/// Its layers, as SolarLayers keyed them (layers.dart).
Layers measureSectionNavItem(WidgetTester tester) =>
    measureLayers(tester, find.byType(SolarSectionNavItem), 'sectionNavItem');
