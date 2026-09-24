import 'package:flutter_test/flutter_test.dart';
import 'package:solar_flutter/solar_flutter.dart';

import '../harness.dart';
import '../layers.dart';

const tabsCase = VisualCase(build: buildTabs, measure: measureTabs);

/// The strip's own layers, and each tab it holds by its layer, measured as a tab's check measures
/// one (layers.dart).
Layers measureTabs(WidgetTester tester) {
  final strip = find.byType(SolarTabs);
  final own = measureLayers(tester, strip, 'tabs');
  measureHeld(tester, strip, own, const {'tabItem': 'tabItem'});
  return own;
}
