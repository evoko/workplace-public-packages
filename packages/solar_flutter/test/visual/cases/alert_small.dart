import 'package:flutter_test/flutter_test.dart';
import 'package:solar_flutter/solar_flutter.dart';

import '../harness.dart';
import '../layers.dart';

const alertSmallCase = VisualCase(
  build: buildAlertSmall,
  measure: measureAlertSmall,
);

/// The callout and its parts, as SolarLayers keyed them (layers.dart); its mark is a
/// StatusIndicator, measured as that check measures one.
Layers measureAlertSmall(WidgetTester tester) =>
    measureLayers(tester, find.byType(SolarAlertSmall), 'alertSmall');
