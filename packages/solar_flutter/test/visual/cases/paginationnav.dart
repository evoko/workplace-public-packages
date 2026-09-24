import 'package:flutter_test/flutter_test.dart';
import 'package:solar_flutter/solar_flutter.dart';

import '../harness.dart';
import '../layers.dart';

const paginationNavCase = VisualCase(
  build: buildPaginationNav,
  measure: measurePaginationNav,
);

/// Its layers, as SolarLayers keyed them (layers.dart).
Layers measurePaginationNav(WidgetTester tester) =>
    measureLayers(tester, find.byType(SolarPaginationNav), 'paginationNav');
