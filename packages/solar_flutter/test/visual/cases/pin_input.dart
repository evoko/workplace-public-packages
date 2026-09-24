import 'package:flutter_test/flutter_test.dart';
import 'package:solar_flutter/solar_flutter.dart';

import '../harness.dart';
import '../layers.dart';

const pinInputCase = VisualCase(build: buildPINInput, measure: measurePINInput);

/// The label, the cells and their digits, the helper and the error, as SolarLayers keyed them
/// (layers.dart).
Layers measurePINInput(WidgetTester tester) =>
    measureLayers(tester, find.byType(SolarPINInput), 'pinInput');
