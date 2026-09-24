import 'package:flutter_test/flutter_test.dart';
import 'package:solar_flutter/solar_flutter.dart';

import '../harness.dart';
import '../layers.dart';

const nodeEndCase = VisualCase(build: buildNodeEnd, measure: measureNodeEnd);

/// The dot and its halo, as SolarLayers keyed them (layers.dart).
Layers measureNodeEnd(WidgetTester tester) =>
    measureLayers(tester, find.byType(SolarNodeEnd), 'nodeEnd');
