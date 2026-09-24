import 'package:flutter_test/flutter_test.dart';
import 'package:solar_flutter/solar_flutter.dart';

import '../harness.dart';
import '../layers.dart';

const sliderRangeCase = VisualCase(
  build: buildSliderRange,
  measure: measureSliderRange,
);

/// The rail, fill and handles, as SolarLayers keyed them (layers.dart).
Layers measureSliderRange(WidgetTester tester) =>
    measureLayers(tester, find.byType(SolarSliderRange), 'sliderRange');
