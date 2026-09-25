import 'package:flutter_test/flutter_test.dart';
import 'package:solar_flutter/solar_flutter.dart';

import '../harness.dart';
import '../layers.dart';

const statusCardCase = VisualCase(
  build: buildStatusCard,
  measure: measureStatusCard,
);

/// The card and its parts, as SolarLayers keyed them (layers.dart); its StatusIndicator is
/// measured as the StatusIndicator check measures one.
Layers measureStatusCard(WidgetTester tester) =>
    measureLayers(tester, find.byType(SolarStatusCard), 'statusCard');
