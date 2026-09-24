import 'package:flutter_test/flutter_test.dart';
import 'package:solar_flutter/solar_flutter.dart';

import '../harness.dart';
import '../layers.dart';

const dropdownItemCase = VisualCase(
  build: buildDropdownItem,
  measure: measureDropdownItem,
);

/// The row and its parts, as SolarLayers keyed them (layers.dart); its box is a Checkbox, measured
/// as that check measures one.
Layers measureDropdownItem(WidgetTester tester) =>
    measureLayers(tester, find.byType(SolarDropdownItem), 'dropdownItem');
