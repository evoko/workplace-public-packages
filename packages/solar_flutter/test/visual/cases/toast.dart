import 'package:flutter_test/flutter_test.dart';
import 'package:solar_flutter/solar_flutter.dart';

import '../harness.dart';
import '../layers.dart';

const toastCase = VisualCase(build: buildToast, measure: measureToast);

/// The pill and its parts, as SolarLayers keyed them (layers.dart); its Tag is measured as the
/// Tag check measures one.
Layers measureToast(WidgetTester tester) =>
    measureLayers(tester, find.byType(SolarToast), 'toast');
