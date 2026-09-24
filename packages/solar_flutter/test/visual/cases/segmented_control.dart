import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:solar_flutter/solar_flutter.dart';

import '../harness.dart';
import '../layers.dart';

const segmentedControlCase = VisualCase(
  build: buildSegmentedControl,
  measure: measureSegmentedControl,
);

/// The control's own layers, and each segment it holds by its layer, measured as the segment's
/// check measures one (layers.dart).
Layers measureSegmentedControl(WidgetTester tester) {
  final control = find.byWidgetPredicate((w) => w is SolarSegmentedControl);
  final own = measureLayers(tester, control, 'segmentedControl');
  for (final keyed in tester.widgetList<KeyedSubtree>(
    find.descendant(of: control, matching: find.byType(KeyedSubtree)),
  )) {
    final key = keyed.key;
    if (key is! ValueKey<String> ||
        !key.value.startsWith('segmentedControlItem')) {
      continue;
    }
    if (key.value.contains('.')) continue;
    own[key.value] = {
      'drawn': true,
      'layers': measureLayers(tester, find.byKey(key), 'segmentedControlItem'),
    };
  }
  return own;
}
