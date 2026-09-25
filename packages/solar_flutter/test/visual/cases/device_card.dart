import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:solar_flutter/solar_flutter.dart';

import '../harness.dart';
import '../layers.dart';
import 'button.dart';

const deviceCardCase = VisualCase(
  build: buildDeviceCard,
  measure: measureDeviceCard,
);

/// The card and its parts, as SolarLayers keyed them (layers.dart); its Tags are measured as the
/// Tag check measures one, and the caller's Button and Dropdown as their own checks measure one.
Layers measureDeviceCard(WidgetTester tester) {
  final own = measureLayers(tester, find.byType(SolarDeviceCard), 'deviceCard');
  final button = find.byKey(const Key('deviceCard.button'));
  own['button'] = button.evaluate().isEmpty
      ? {'drawn': false}
      : {'drawn': true, 'layers': measureButtonAt(tester, button)};
  final devices = find.byKey(const Key('deviceCard.devices'));
  own['devices'] = devices.evaluate().isEmpty
      ? {'drawn': false}
      : {'drawn': true, 'layers': measureLayers(tester, devices, 'dropdown')};
  return own;
}
