import 'package:flutter_test/flutter_test.dart';
import 'package:solar_flutter/solar_flutter.dart';

import '../harness.dart';
import '../layers.dart';

const dropdownCase = VisualCase(build: buildDropdown, measure: measureDropdown);

/// The field and its parts, as SolarLayers keyed them (layers.dart).
Layers measureDropdown(WidgetTester tester) => measureLayers(
  tester,
  find.byWidgetPredicate((w) => w is SolarDropdown),
  'dropdown',
);
