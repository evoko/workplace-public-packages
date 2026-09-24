import 'package:flutter_test/flutter_test.dart';
import 'package:solar_flutter/solar_flutter.dart';

import '../harness.dart';
import '../layers.dart';

const toggleCase = VisualCase(build: buildToggle, measure: measureToggle);

/// The track and thumb, as SolarLayers keyed them (layers.dart).
Layers measureToggle(WidgetTester tester) =>
    measureLayers(tester, find.byType(SolarToggle), 'toggle');
