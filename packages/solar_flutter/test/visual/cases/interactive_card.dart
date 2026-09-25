import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:solar_flutter/solar_flutter.dart';

import '../harness.dart';
import '../layers.dart';
import 'icon_button.dart';

const interactiveCardCase = VisualCase(
  build: buildInteractiveCard,
  measure: measureInteractiveCard,
);

/// The card and its parts, as SolarLayers keyed them (layers.dart); its drag handle and control
/// are measured as their own checks measure one, and its actions, the caller's Icon Buttons, as
/// the Icon Button check measures one.
Layers measureInteractiveCard(WidgetTester tester) {
  final own = measureLayers(
    tester,
    find.byType(SolarInteractiveCard),
    'interactiveCard',
  );
  for (final layer in ['iconButton', 'iconButton2', 'iconButton3']) {
    final at = find.byKey(ValueKey('interactiveCard.$layer'));
    own[layer] = at.evaluate().isEmpty
        ? {'drawn': false}
        : {'drawn': true, 'layers': measureIconButtonAt(tester, at)};
  }
  return own;
}
