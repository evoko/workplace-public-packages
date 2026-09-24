import 'package:flutter_test/flutter_test.dart';
import 'package:solar_flutter/solar_flutter.dart';

import '../harness.dart';
import '../layers.dart';

const paginationCase = VisualCase(
  build: buildPagination,
  measure: measurePagination,
);

/// The pagination, and each item in the layer Figma draws at its place, as SolarLayers keyed them
/// (layers.dart), each measured as its own check measures one.
Layers measurePagination(WidgetTester tester) =>
    measureLayers(tester, find.byType(SolarPagination), 'pagination');
