import 'package:flutter_test/flutter_test.dart';
import 'package:solar_flutter/solar_flutter.dart';

import '../harness.dart';
import '../layers.dart';

const tooltipCase = VisualCase(build: buildTooltip, measure: measureTooltip);

/// The bubble, its words and its arrow, as SolarLayers keyed them (layers.dart).
Layers measureTooltip(WidgetTester tester) =>
    measureLayers(tester, find.byType(SolarTooltip), 'tooltip');
