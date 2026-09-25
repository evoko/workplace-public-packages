import 'package:flutter_test/flutter_test.dart';
import 'package:solar_flutter/solar_flutter.dart';

import '../harness.dart';
import '../layers.dart';

const scrimCase = VisualCase(build: buildScrim, measure: measureScrim);

/// Its one layer, as SolarLayers keyed it (layers.dart).
Layers measureScrim(WidgetTester tester) =>
    measureLayers(tester, find.byType(SolarScrim), 'scrim');
