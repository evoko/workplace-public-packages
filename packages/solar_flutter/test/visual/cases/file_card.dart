import 'package:flutter_test/flutter_test.dart';
import 'package:solar_flutter/solar_flutter.dart';

import '../harness.dart';
import '../layers.dart';

const fileCardCase = VisualCase(build: buildFileCard, measure: measureFileCard);

/// The tile and its parts, as SolarLayers keyed them (layers.dart).
Layers measureFileCard(WidgetTester tester) =>
    measureLayers(tester, find.byType(SolarFileCard), 'fileCard');
