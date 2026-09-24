import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:solar_flutter/solar_flutter.dart';

import '../harness.dart';
import '../layers.dart';
import 'button.dart';

const bannerCase = VisualCase(build: buildBanner, measure: measureBanner);

/// The strip and its parts, as SolarLayers keyed them (layers.dart); its Buttons are measured as
/// the Button check measures one.
Layers measureBanner(WidgetTester tester) {
  final own = measureLayers(tester, find.byType(SolarBanner), 'banner');
  for (final layer in ['primaryButton', 'secondaryButton']) {
    final at = find.byKey(Key('banner.$layer'));
    own[layer] = at.evaluate().isEmpty
        ? {'drawn': false}
        : {'drawn': true, 'layers': measureButtonAt(tester, at)};
  }
  return own;
}
