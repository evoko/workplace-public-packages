import 'package:flutter_test/flutter_test.dart';
import 'package:solar_flutter/solar_flutter.dart';

import '../harness.dart';
import '../layers.dart';

const stepCase = VisualCase(build: buildStep, measure: measureStep);

/// Its layers, as SolarLayers keyed them (layers.dart).
Layers measureStep(WidgetTester tester) =>
    measureLayers(tester, find.byType(SolarStep), 'step');
