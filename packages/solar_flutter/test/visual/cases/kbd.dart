import 'package:flutter_test/flutter_test.dart';
import 'package:solar_flutter/solar_flutter.dart';

import '../harness.dart';
import '../layers.dart';

const kbdCase = VisualCase(build: buildKbd, measure: measureKbd);

/// The key cap and its label, as SolarLayers keyed them (layers.dart).
Layers measureKbd(WidgetTester tester) =>
    measureLayers(tester, find.byType(SolarKbd), 'kbd');
