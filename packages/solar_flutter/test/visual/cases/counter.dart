import 'package:flutter_test/flutter_test.dart';
import 'package:solar_flutter/solar_flutter.dart';

import '../harness.dart';
import '../layers.dart';

const counterCase = VisualCase(
  build: buildCounter,
  measure: measureCounter,
  layersAt: counterLayers,
);

/// SolarCounter's layers where it is drawn, alone or inside another widget (a Button's slot), as
/// SolarLayers keyed them (layers.dart).
Layers counterLayers(WidgetTester tester, Finder at) =>
    measureLayers(tester, at, 'counter');

/// A pumped SolarCounter's layers.
Layers measureCounter(WidgetTester tester) =>
    counterLayers(tester, find.byType(SolarCounter));
