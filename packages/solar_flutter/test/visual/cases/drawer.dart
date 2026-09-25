import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:solar_flutter/solar_flutter.dart';

import '../harness.dart';
import '../layers.dart';
import 'button_group.dart';
import 'icon_button.dart';

const drawerCase = VisualCase(build: buildDrawer, measure: measureDrawer);

/// The panel and its parts, as SolarLayers keyed them (layers.dart); its close button as the Icon
/// Button check measures one, and its footer as the Button Group check measures one.
Layers measureDrawer(WidgetTester tester) {
  final own = measureLayers(tester, find.byType(SolarDrawer), 'drawer');
  own['cta'] = {'drawn': true, 'layers': measureButtonGroup(tester)};
  final close = find.byKey(const Key('drawer.close'));
  if (close.evaluate().isNotEmpty) {
    own['close'] = {
      'drawn': true,
      'layers': measureIconButtonAt(tester, close),
    };
  }
  return own;
}
