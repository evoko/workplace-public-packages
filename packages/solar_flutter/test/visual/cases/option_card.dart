import 'package:flutter_test/flutter_test.dart';
import 'package:solar_flutter/solar_flutter.dart';

import '../harness.dart';
import '../layers.dart';

const optionCardCase = VisualCase(
  build: buildOptionCard,
  measure: measureOptionCard,
);

/// The tile and its parts, as SolarLayers keyed them (layers.dart).
Layers measureOptionCard(WidgetTester tester) =>
    measureLayers(tester, find.byType(SolarOptionCard), 'optionCard');
