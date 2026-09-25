import 'package:flutter_test/flutter_test.dart';
import 'package:solar_flutter/solar_flutter.dart';

import '../harness.dart';
import '../layers.dart';

const expandableCardCase = VisualCase(
  build: buildExpandableCard,
  measure: measureExpandableCard,
);

/// The card and its parts, as SolarLayers keyed them (layers.dart).
Layers measureExpandableCard(WidgetTester tester) =>
    measureLayers(tester, find.byType(SolarExpandableCard), 'expandableCard');
