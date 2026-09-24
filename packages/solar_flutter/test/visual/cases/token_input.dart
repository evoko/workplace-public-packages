import 'package:flutter_test/flutter_test.dart';
import 'package:solar_flutter/solar_flutter.dart';

import '../harness.dart';
import '../layers.dart';

const tokenInputCase = VisualCase(
  build: buildTokenInput,
  measure: measureTokenInput,
);

/// The label, the field, its input, Counter and helper, as SolarLayers keyed them (layers.dart);
/// its Tags, the entries, in the order Figma's layers draw them, as the Tag check measures one.
Layers measureTokenInput(WidgetTester tester) {
  final at = find.byType(SolarTokenInput);
  final own = measureLayers(tester, at, 'tokenInput');
  final tags = find.descendant(of: at, matching: find.byType(SolarTag));
  final count = tags.evaluate().length;
  for (final (i, layer) in ['tag', 'tag2'].indexed) {
    own[layer] = i < count
        ? {'drawn': true, 'layers': measureLayers(tester, tags.at(i), 'tag')}
        : {'drawn': false};
  }
  return own;
}
