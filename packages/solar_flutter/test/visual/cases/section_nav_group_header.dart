import 'package:flutter_test/flutter_test.dart';
import 'package:solar_flutter/solar_flutter.dart';

import '../harness.dart';
import '../layers.dart';

const sectionNavGroupHeaderCase = VisualCase(
  build: buildSectionNavGroupHeader,
  measure: measureSectionNavGroupHeader,
);

/// Its layers, as SolarLayers keyed them (layers.dart).
Layers measureSectionNavGroupHeader(WidgetTester tester) => measureLayers(
  tester,
  find.byType(SolarSectionNavGroupHeader),
  'sectionNavGroupHeader',
);
