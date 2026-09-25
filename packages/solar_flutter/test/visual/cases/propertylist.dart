import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:solar_flutter/solar_flutter.dart';

import '../harness.dart';
import '../layers.dart';
import 'propertyrow.dart';

const propertyListCase = VisualCase(
  build: buildPropertyList,
  measure: measurePropertyList,
);

/// The list's own layers, and each row and divider it holds by its layer, measured as their checks
/// measure one (layers.dart).
Layers measurePropertyList(WidgetTester tester) {
  final list = find.byType(SolarPropertyList);
  final own = measureLayers(tester, list, 'propertyList');
  measureHeld(tester, list, own, const {'divider': 'divider'});
  for (final keyed in tester.widgetList<KeyedSubtree>(
    find.descendant(of: list, matching: find.byType(KeyedSubtree)),
  )) {
    final key = keyed.key;
    if (key is! ValueKey<String> || !key.value.startsWith('propertyRow')) {
      continue;
    }
    if (key.value.contains('.')) continue;
    own[key.value] = {
      'drawn': true,
      'layers': measurePropertyRowAt(tester, find.byKey(key)),
    };
  }
  return own;
}
