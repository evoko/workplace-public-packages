import 'package:flutter_test/flutter_test.dart';
import 'package:solar_flutter/solar_flutter.dart';

import '../harness.dart';
import '../layers.dart';

const pageNavButtonCase = VisualCase(
  build: buildPageNavButton,
  measure: measurePageNavButton,
);

/// Its layers, as SolarLayers keyed them (layers.dart).
Layers measurePageNavButton(WidgetTester tester) =>
    measureLayers(tester, find.byType(SolarPageNavButton), 'pageNavButton');
