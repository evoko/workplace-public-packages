import 'package:flutter_test/flutter_test.dart';
import 'package:solar_flutter/solar_flutter.dart';

import '../harness.dart';
import '../layers.dart';

const trendBadgeCase = VisualCase(
  build: buildTrendBadge,
  measure: measureTrendBadge,
);

/// The disc and its mark, as SolarLayers keyed them (layers.dart).
Layers measureTrendBadge(WidgetTester tester) =>
    measureLayers(tester, find.byType(SolarTrendBadge), 'trendBadge');
