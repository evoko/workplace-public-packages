import 'package:flutter_test/flutter_test.dart';
import 'package:solar_flutter/solar_flutter.dart';

import '../harness.dart';
import '../layers.dart';

const navItemCase = VisualCase(build: buildNavItem, measure: measureNavItem);

/// The item, its icon and its label, as SolarLayers keyed them (layers.dart).
Layers measureNavItem(WidgetTester tester) =>
    measureLayers(tester, find.byType(SolarNavItem), 'navItem');
