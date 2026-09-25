import 'package:flutter_test/flutter_test.dart';
import 'package:solar_flutter/solar_flutter.dart';

import '../harness.dart';
import '../layers.dart';

const popoverCase = VisualCase(build: buildPopover, measure: measurePopover);

/// The bubble, its words and its tip, as SolarLayers keyed them (layers.dart).
Layers measurePopover(WidgetTester tester) =>
    measureLayers(tester, find.byType(SolarPopover), 'popover');
