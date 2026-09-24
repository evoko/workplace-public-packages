import 'package:flutter_test/flutter_test.dart';
import 'package:solar_flutter/solar_flutter.dart';

import '../harness.dart';
import '../layers.dart';

const tabItemCase = VisualCase(build: buildTabItem, measure: measureTabItem);

/// The tab and its parts, as SolarLayers keyed them (layers.dart); its counter is a Counter,
/// measured as that check measures one.
Layers measureTabItem(WidgetTester tester) =>
    measureLayers(tester, find.byType(SolarTabItem), 'tabItem');
