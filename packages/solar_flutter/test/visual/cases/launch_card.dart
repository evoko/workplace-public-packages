import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:solar_flutter/solar_flutter.dart';

import '../harness.dart';
import '../layers.dart';
import 'button_group.dart';
import 'icon_button.dart';

const launchCardCase = VisualCase(
  build: buildLaunchCard,
  measure: measureLaunchCard,
);

/// The card and its parts, as SolarLayers keyed them (layers.dart); the caller's favourite and
/// Button Group are measured as their own checks measure one.
Layers measureLaunchCard(WidgetTester tester) {
  final own = measureLayers(tester, find.byType(SolarLaunchCard), 'launchCard');
  for (final layer in ['favourite', 'favouriteNoImage']) {
    final at = find.byKey(Key('launchCard.$layer'));
    if (at.evaluate().isEmpty) {
      own[layer] = {'drawn': false};
      continue;
    }
    // Where the card places it, as SolarLayers keyed it, and its look as the Icon Button's.
    final layers = measureIconButtonAt(tester, at);
    final place = own[layer] ?? const {};
    layers['root'] = {
      ...?layers['root'],
      for (final edge in ['x', 'y', 'right', 'bottom'])
        if (place[edge] != null) edge: place[edge],
    };
    own[layer] = {'drawn': true, 'layers': layers};
  }
  own['actions'] = {'drawn': true, 'layers': measureButtonGroup(tester)};
  return own;
}
