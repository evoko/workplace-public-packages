import 'package:flutter_test/flutter_test.dart';
import 'package:solar_flutter/solar_flutter.dart';

import '../harness.dart';
import '../layers.dart';

const passwordInputCase = VisualCase(
  build: buildPasswordInput,
  measure: measurePasswordInput,
);

/// The label, the field, its words and eye, the helper and the link, as SolarLayers keyed them
/// (layers.dart).
Layers measurePasswordInput(WidgetTester tester) =>
    measureLayers(tester, find.byType(SolarPasswordInput), 'passwordInput');
