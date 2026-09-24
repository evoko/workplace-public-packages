import 'package:flutter_test/flutter_test.dart';
import 'package:solar_flutter/solar_flutter.dart';

import '../harness.dart';
import '../layers.dart';

const statusIndicatorCase = VisualCase(
  build: buildStatusIndicator,
  measure: measureStatusIndicator,
);

/// Every layer the mark draws, as SolarLayers keyed it (layers.dart).
Layers measureStatusIndicator(WidgetTester tester) =>
    measureLayers(tester, find.byType(SolarStatusIndicator), 'statusIndicator');
