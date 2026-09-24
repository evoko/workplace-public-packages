import 'package:flutter_test/flutter_test.dart';
import 'package:solar_flutter/solar_flutter.dart';

import '../harness.dart';
import '../layers.dart';

const optionRowCase = VisualCase(
  build: buildOptionRow,
  measure: measureOptionRow,
);

/// The row and its parts, as SolarLayers keyed them (layers.dart); its control is a Checkbox, a
/// Radio or a Toggle, measured as that check measures one.
Layers measureOptionRow(WidgetTester tester) => measureLayers(
  tester,
  find.byWidgetPredicate((w) => w is SolarOptionRow),
  'optionRow',
);
