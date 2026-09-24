import 'package:flutter_test/flutter_test.dart';
import 'package:solar_flutter/solar_flutter.dart';

import '../harness.dart';
import '../layers.dart';

const tagCase = VisualCase(build: buildTag, measure: measureTag);

/// The pill and its parts, as SolarLayers keyed them (layers.dart); its dot is a StatusIndicator,
/// measured as that check measures one.
Layers measureTag(WidgetTester tester) =>
    measureLayers(tester, find.byType(SolarTag), 'tag');
