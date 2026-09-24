import 'package:flutter_test/flutter_test.dart';
import 'package:solar_flutter/solar_flutter.dart';

import '../harness.dart';
import '../layers.dart';

const paginationItemCase = VisualCase(
  build: buildPaginationItem,
  measure: measurePaginationItem,
);

/// Its layers, as SolarLayers keyed them (layers.dart).
Layers measurePaginationItem(WidgetTester tester) =>
    measureLayers(tester, find.byType(SolarPaginationItem), 'paginationItem');
