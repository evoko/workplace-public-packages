import 'package:flutter_test/flutter_test.dart';
import 'package:solar_flutter/solar_flutter.dart';

import '../harness.dart';
import '../layers.dart';

const dragHandleCase = VisualCase(
  build: buildDragHandle,
  measure: measureDragHandle,
);

/// The grip and its dots, as SolarLayers keyed them (layers.dart).
Layers measureDragHandle(WidgetTester tester) =>
    measureLayers(tester, find.byType(SolarDragHandle), 'dragHandle');
