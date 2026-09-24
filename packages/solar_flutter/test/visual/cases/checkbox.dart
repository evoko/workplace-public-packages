import 'package:flutter_test/flutter_test.dart';
import 'package:solar_flutter/solar_flutter.dart';

import '../harness.dart';
import '../layers.dart';

const checkboxCase = VisualCase(build: buildCheckbox, measure: measureCheckbox);

/// The box, tick and dash, as SolarLayers keyed them (layers.dart).
Layers measureCheckbox(WidgetTester tester) =>
    measureLayers(tester, find.byType(SolarCheckbox), 'checkbox');
