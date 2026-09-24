import 'package:flutter_test/flutter_test.dart';
import 'package:solar_flutter/solar_flutter.dart';

import '../harness.dart';
import '../layers.dart';

const cursorCase = VisualCase(build: buildCursor, measure: measureCursor);

/// The glyph's layers, as SolarLayers keyed them (layers.dart).
Layers measureCursor(WidgetTester tester) =>
    measureLayers(tester, find.byType(SolarCursor), 'cursor');
