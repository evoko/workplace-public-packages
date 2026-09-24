import 'package:flutter_test/flutter_test.dart';
import 'package:solar_flutter/solar_flutter.dart';

import '../harness.dart';
import '../layers.dart';

const searchFieldCase = VisualCase(
  build: buildSearchField,
  measure: measureSearchField,
);

/// The field, its icon, query and filter, as SolarLayers keyed them (layers.dart).
Layers measureSearchField(WidgetTester tester) =>
    measureLayers(tester, find.byType(SolarSearchField), 'searchField');
