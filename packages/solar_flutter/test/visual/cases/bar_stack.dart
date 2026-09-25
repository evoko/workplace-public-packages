import 'package:flutter_test/flutter_test.dart';
import 'package:solar_flutter/solar_flutter.dart';

import '../harness.dart';
import '../layers.dart';

const barStackCase = VisualCase(build: buildBarStack, measure: measureBarStack);

/// The stack's frame, as SolarLayers keyed it (layers.dart).
Layers measureBarStack(WidgetTester tester) =>
    measureLayers(tester, find.byType(SolarBarStack), 'barStack');
