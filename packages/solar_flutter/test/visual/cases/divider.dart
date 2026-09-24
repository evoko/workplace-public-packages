import 'package:flutter_test/flutter_test.dart';
import 'package:solar_flutter/solar_flutter.dart';

import '../harness.dart';
import '../layers.dart';

const dividerCase = VisualCase(build: buildDivider, measure: measureDivider);

/// The divider, its rules and its label, as SolarLayers keyed them (layers.dart).
Layers measureDivider(WidgetTester tester) =>
    measureLayers(tester, find.byType(SolarDivider), 'divider');
