import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:solar_flutter/solar_flutter.dart';

import '../harness.dart';
import '../layers.dart';
import 'icon_button.dart';

// Wider than the test's screen: each control at its own size, the Segmented Control with the six
// segments its own check draws.
const tableHeaderCase = VisualCase(
  build: buildTableHeader,
  measure: measureTableHeader,
  surface: Size(1200, 600),
);

/// The strip and its parts, as SolarLayers keyed them (layers.dart); its SearchField and Segmented
/// Control measured as their own checks measure one, the control's segments with it, and its
/// actions, the caller's Icon Buttons, as the Icon Button check measures one.
Layers measureTableHeader(WidgetTester tester) {
  final strip = find.byType(SolarTableHeader);
  final own = measureLayers(tester, strip, 'tableHeader');
  for (final layer in ['segmentedControl', 'segmentedControlMobile']) {
    final control = own[layer]?['layers'];
    if (control is! Layers) continue;
    final at = find.byKey(ValueKey('tableHeader.$layer'));
    for (final keyed in tester.widgetList<KeyedSubtree>(
      find.descendant(of: at, matching: find.byType(KeyedSubtree)),
    )) {
      final key = keyed.key;
      if (key is! ValueKey<String> ||
          !key.value.startsWith('segmentedControlItem') ||
          key.value.contains('.')) {
        continue;
      }
      control[key.value] = {
        'drawn': true,
        'layers': measureLayers(
          tester,
          find.descendant(of: at, matching: find.byKey(key)),
          'segmentedControlItem',
        ),
      };
    }
  }
  for (final keyed in tester.widgetList<KeyedSubtree>(
    find.descendant(of: strip, matching: find.byType(KeyedSubtree)),
  )) {
    final key = keyed.key;
    if (key is! ValueKey<String> || !key.value.contains('IconButton')) {
      continue;
    }
    own[key.value.substring('tableHeader.'.length)] = {
      'drawn': true,
      'layers': measureIconButtonAt(tester, find.byKey(key)),
    };
  }
  return own;
}
