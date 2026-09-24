import 'package:flutter_test/flutter_test.dart';
import 'package:solar_flutter/solar_flutter.dart';

import '../harness.dart';
import '../layers.dart';

const globalSearchCase = VisualCase(
  build: buildGlobalSearch,
  measure: measureGlobalSearch,
);

/// The trigger, its icon and words, as SolarLayers keyed them (layers.dart); its Kbd measured as
/// the Kbd check measures one.
Layers measureGlobalSearch(WidgetTester tester) =>
    measureLayers(tester, find.byType(SolarGlobalSearch), 'globalSearch');
