import 'package:flutter_test/flutter_test.dart';
import 'package:solar_flutter/solar_flutter.dart';

import '../harness.dart';
import '../layers.dart';

const alertCase = VisualCase(build: buildAlert, measure: measureAlert);

/// The callout and its parts, as SolarLayers keyed them (layers.dart); its mark is a
/// StatusIndicator, measured as that check measures one.
Layers measureAlert(WidgetTester tester) =>
    measureLayers(tester, find.byType(SolarAlert), 'alert');
