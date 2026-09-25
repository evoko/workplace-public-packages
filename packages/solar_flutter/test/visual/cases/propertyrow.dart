import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:solar_flutter/solar_flutter.dart';

import '../harness.dart';
import '../layers.dart';
import 'button.dart';
import 'icon_button.dart';

const propertyRowCase = VisualCase(
  build: buildPropertyRow,
  measure: measurePropertyRow,
  // Wider than the test's screen: a six-segment control beside the row's words.
  surface: Size(1200, 600),
);

/// The row and its parts, as SolarLayers keyed them (layers.dart); its control measured as its own
/// check measures one, the Segmented Control's segments with it.
Layers measurePropertyRow(WidgetTester tester) =>
    measurePropertyRowAt(tester, find.byType(SolarPropertyRow));

/// A row at [at] (a PropertyList's), measured as its own check measures one.
Layers measurePropertyRowAt(WidgetTester tester, Finder at) {
  final own = measureLayers(tester, at, 'propertyRow');
  final button = find.descendant(
    of: at,
    matching: find.byKey(const ValueKey('propertyRow.buttonCase')),
  );
  if (button.evaluate().isNotEmpty) {
    own['button'] = {'drawn': true, 'layers': measureButtonAt(tester, button)};
  }
  final icon = find.descendant(
    of: at,
    matching: find.byKey(const ValueKey('propertyRow.iconButtonCase')),
  );
  if (icon.evaluate().isNotEmpty) {
    own['iconButton'] = {
      'drawn': true,
      'layers': measureIconButtonAt(tester, icon),
    };
  }
  final control = own['segmentedControl']?['layers'];
  if (control is Layers) {
    final held = find.descendant(
      of: at,
      matching: find.byKey(const ValueKey('propertyRow.segmentedControl')),
    );
    for (final keyed in tester.widgetList<KeyedSubtree>(
      find.descendant(of: held, matching: find.byType(KeyedSubtree)),
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
          find.descendant(of: held, matching: find.byKey(key)),
          'segmentedControlItem',
        ),
      };
    }
  }
  return own;
}
