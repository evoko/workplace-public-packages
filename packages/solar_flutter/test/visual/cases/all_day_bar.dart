import 'package:flutter_test/flutter_test.dart';
import 'package:solar_flutter/solar_flutter.dart';

import '../harness.dart';
import '../layers.dart';

const allDayBarCase = VisualCase(
  build: buildAllDayBar,
  measure: measureAllDayBar,
);

/// The bar, its stripe and its words, as SolarLayers keyed them (layers.dart).
Layers measureAllDayBar(WidgetTester tester) =>
    measureLayers(tester, find.byType(SolarAllDayBar), 'allDayBar');
