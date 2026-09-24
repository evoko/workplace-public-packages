import 'package:flutter_test/flutter_test.dart';
import 'package:solar_flutter/solar_flutter.dart';

import '../harness.dart';
import '../layers.dart';

const breadcrumbItemCase = VisualCase(
  build: buildBreadcrumbItem,
  measure: measureBreadcrumbItem,
);

/// The segment and its words, as SolarLayers keyed them (layers.dart).
Layers measureBreadcrumbItem(WidgetTester tester) =>
    measureLayers(tester, find.byType(SolarBreadcrumbItem), 'breadcrumbItem');
