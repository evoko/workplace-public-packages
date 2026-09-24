import 'package:flutter_test/flutter_test.dart';
import 'package:solar_flutter/solar_flutter.dart';

import '../harness.dart';
import '../layers.dart';

const pageNavigatorCase = VisualCase(
  build: buildPageNavigator,
  measure: measurePageNavigator,
);

/// Its layers, as SolarLayers keyed them (layers.dart).
Layers measurePageNavigator(WidgetTester tester) =>
    measureLayers(tester, find.byType(SolarPageNavigator), 'pageNavigator');
