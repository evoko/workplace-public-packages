import 'package:flutter_test/flutter_test.dart';
import 'package:solar_flutter/solar_flutter.dart';

import '../harness.dart';
import '../layers.dart';

const rowSelectCase = VisualCase(
  build: buildRowSelect,
  measure: measureRowSelect,
);

/// The cell and its Checkbox, as SolarLayers keyed them (layers.dart); the Checkbox measured as its
/// own check measures one.
Layers measureRowSelect(WidgetTester tester) =>
    measureLayers(tester, find.byType(SolarRowSelect), 'rowSelect');
