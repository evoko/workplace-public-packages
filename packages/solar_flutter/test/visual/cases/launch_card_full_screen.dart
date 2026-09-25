import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:solar_flutter/solar_flutter.dart';

import '../harness.dart';
import '../layers.dart';
import 'button.dart';
import 'icon_button.dart';

const launchCardFullScreenCase = VisualCase(
  build: buildLaunchCardFullScreen,
  measure: measureLaunchCardFullScreen,
);

/// The page and its parts, as SolarLayers keyed them (layers.dart); the caller's favourite and
/// Button are measured as their own checks measure one.
Layers measureLaunchCardFullScreen(WidgetTester tester) {
  final own = measureLayers(
    tester,
    find.byType(SolarLaunchCardFullScreen),
    'launchCardFullScreen',
  );
  final favourite = find.byKey(const Key('launchCardFullScreen.favourite'));
  own['favourite'] = {
    'drawn': true,
    'layers': measureIconButtonAt(tester, favourite),
  };
  final action = find.byKey(const Key('launchCardFullScreen.action'));
  own['action'] = {'drawn': true, 'layers': measureButtonAt(tester, action)};
  return own;
}
