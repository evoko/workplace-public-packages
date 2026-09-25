import 'package:flutter_test/flutter_test.dart';
import 'package:solar_flutter/solar_flutter.dart';

import '../harness.dart';
import '../layers.dart';

const barCase = VisualCase(build: buildBar, measure: measureBar);

/// The bar, as SolarLayers keyed it (layers.dart).
Layers measureBar(WidgetTester tester) =>
    measureLayers(tester, find.byType(SolarBar), 'bar');
