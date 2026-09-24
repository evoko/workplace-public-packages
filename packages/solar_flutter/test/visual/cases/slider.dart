import 'package:flutter_test/flutter_test.dart';
import 'package:solar_flutter/solar_flutter.dart';

import '../harness.dart';
import '../layers.dart';

const sliderCase = VisualCase(build: buildSlider, measure: measureSlider);

/// The rail, fill and handles, as SolarLayers keyed them (layers.dart).
Layers measureSlider(WidgetTester tester) =>
    measureLayers(tester, find.byType(SolarSlider), 'slider');
