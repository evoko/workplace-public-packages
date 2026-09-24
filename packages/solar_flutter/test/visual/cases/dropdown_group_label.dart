import 'package:flutter_test/flutter_test.dart';
import 'package:solar_flutter/solar_flutter.dart';

import '../harness.dart';
import '../layers.dart';

const dropdownGroupLabelCase = VisualCase(
  build: buildDropdownGroupLabel,
  measure: measureDropdownGroupLabel,
);

/// The heading and its words, as SolarLayers keyed them (layers.dart).
Layers measureDropdownGroupLabel(WidgetTester tester) => measureLayers(
  tester,
  find.byType(SolarDropdownGroupLabel),
  'dropdownGroupLabel',
);
