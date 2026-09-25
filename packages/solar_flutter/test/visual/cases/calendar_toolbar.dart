import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:solar_flutter/solar_flutter.dart';

import '../harness.dart';
import '../layers.dart';
import 'button.dart';
import 'icon_button.dart';

// Wider than the test's screen: Figma's 1280.
const calendarToolbarCase = VisualCase(
  build: buildCalendarToolbar,
  measure: measureCalendarToolbar,
  surface: Size(1400, 600),
);

/// The bar and its groups, as SolarLayers keyed them (layers.dart); its own Icon Buttons and
/// Buttons measured as their own checks measure one, where the toolbar places them, and the
/// Segmented Control as its own check measures one, its segments with it.
Layers measureCalendarToolbar(WidgetTester tester) {
  final bar = find.byType(SolarCalendarToolbar);
  final own = measureLayers(tester, bar, 'calendarToolbar');
  Layers placed(String layer, Layers layers) {
    final place = own[layer] ?? const {};
    layers['root'] = {
      ...?layers['root'],
      for (final edge in ['x', 'y', 'right', 'bottom'])
        if (place[edge] != null) edge: place[edge],
    };
    return layers;
  }

  Finder at(String layer) => find.byKey(Key('calendarToolbar.$layer'));
  for (final layer in ['prev', 'next']) {
    own[layer] = {
      'drawn': true,
      'layers': placed(layer, measureIconButtonAt(tester, at(layer))),
    };
  }
  for (final layer in ['todayButton', 'action']) {
    own[layer] = {
      'drawn': true,
      'layers': placed(layer, measureButtonAt(tester, at(layer))),
    };
  }
  final control = own['views']?['layers'];
  if (control is Layers) {
    for (final keyed in tester.widgetList<KeyedSubtree>(
      find.descendant(of: at('views'), matching: find.byType(KeyedSubtree)),
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
          find.descendant(of: at('views'), matching: find.byKey(key)),
          'segmentedControlItem',
        ),
      };
    }
  }
  return own;
}
