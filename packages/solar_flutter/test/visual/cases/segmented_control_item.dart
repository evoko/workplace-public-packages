import 'package:flutter_test/flutter_test.dart';
import 'package:solar_flutter/solar_flutter.dart';

import '../harness.dart';
import '../layers.dart';

const segmentedControlItemCase = VisualCase(
  build: buildSegmentedControlItem,
  measure: measureSegmentedControlItem,
);

/// The segment, its words and icons, as SolarLayers keyed them (layers.dart).
Layers measureSegmentedControlItem(WidgetTester tester) => measureLayers(
  tester,
  find.byWidgetPredicate((w) => w is SolarSegmentedControlItem),
  'segmentedControlItem',
);
