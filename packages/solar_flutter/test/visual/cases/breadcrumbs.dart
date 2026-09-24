import 'package:flutter_test/flutter_test.dart';
import 'package:solar_flutter/solar_flutter.dart';

import '../harness.dart';
import '../layers.dart';

const breadcrumbsCase = VisualCase(
  build: buildBreadcrumbs,
  measure: measureBreadcrumbs,
);

/// The trail, its chevrons, and each item in the layer Figma draws at its place, as SolarLayers
/// keyed them (layers.dart), an item measured as a Breadcrumb Item's check measures one.
Layers measureBreadcrumbs(WidgetTester tester) =>
    measureLayers(tester, find.byType(SolarBreadcrumbs), 'breadcrumbs');
