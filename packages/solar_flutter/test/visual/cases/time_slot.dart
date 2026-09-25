import 'package:flutter_test/flutter_test.dart';
import 'package:solar_flutter/solar_flutter.dart';

import '../harness.dart';
import '../layers.dart';

const timeSlotCase = VisualCase(build: buildTimeSlot, measure: measureTimeSlot);

/// The slot and its half-hour rule, as SolarLayers keyed them (layers.dart).
Layers measureTimeSlot(WidgetTester tester) =>
    measureLayers(tester, find.byType(SolarTimeSlot), 'timeSlot');
