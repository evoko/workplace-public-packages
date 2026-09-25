import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:solar_flutter/solar_flutter.dart';

import '../harness.dart';
import '../layers.dart';
import 'button.dart';
import 'icon_button.dart';

const tableFooterCase = VisualCase(
  build: buildTableFooter,
  measure: measureTableFooter,
  // Wider than the test's screen: the desktop strip at Figma's width.
  surface: Size(1200, 600),
);

/// The strip and its parts, as SolarLayers keyed them (layers.dart); its Dropdown and Pagination
/// measured as their own checks measure one, and its action as the Button or the Icon Button check
/// measures one.
Layers measureTableFooter(WidgetTester tester) {
  final own = measureLayers(
    tester,
    find.byType(SolarTableFooter),
    'tableFooter',
  );
  final button = find.byKey(const ValueKey('tableFooter.buttonCase'));
  if (button.evaluate().isNotEmpty) {
    own['button'] = {'drawn': true, 'layers': measureButtonAt(tester, button)};
  }
  final icon = find.byKey(const ValueKey('tableFooter.iconButtonCase'));
  if (icon.evaluate().isNotEmpty) {
    own['iconButton'] = {
      'drawn': true,
      'layers': measureIconButtonAt(tester, icon),
    };
  }
  return own;
}
