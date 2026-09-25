import 'package:flutter_test/flutter_test.dart';
import 'package:solar_flutter/solar_flutter.dart';

import '../harness.dart';
import '../layers.dart';

const containerCase = VisualCase(
  build: buildContainer,
  measure: measureContainer,
);

/// The region and its content slot, as SolarLayers keyed them (layers.dart).
Layers measureContainer(WidgetTester tester) =>
    measureLayers(tester, find.byType(SolarContainer), 'container');
