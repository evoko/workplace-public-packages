import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:solar_flutter/solar_flutter.dart';

import '../harness.dart';
import '../layers.dart';
import 'button.dart';

const actionCardCase = VisualCase(
  build: buildActionCard,
  measure: measureActionCard,
);

/// The card and its parts, as SolarLayers keyed them (layers.dart); its Buttons are measured as
/// the Button check measures one.
Layers measureActionCard(WidgetTester tester) {
  final own = measureLayers(tester, find.byType(SolarActionCard), 'actionCard');
  for (final layer in ['primaryCTA', 'secondaryCTA', 'button']) {
    final at = find.byKey(Key('actionCard.$layer'));
    own[layer] = at.evaluate().isEmpty
        ? {'drawn': false}
        : {'drawn': true, 'layers': measureButtonAt(tester, at)};
  }
  return own;
}
