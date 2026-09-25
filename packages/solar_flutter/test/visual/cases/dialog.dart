import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:solar_flutter/solar_flutter.dart';

import '../harness.dart';
import '../layers.dart';
import 'button_group.dart';
import 'icon_button.dart';

const dialogCase = VisualCase(build: buildDialog, measure: measureDialog);

/// The surface and its parts, as SolarLayers keyed them (layers.dart); its close button and
/// Stepper measured as their own checks measure one, and its Button Group as the Button Group check
/// measures one.
Layers measureDialog(WidgetTester tester) {
  final own = measureLayers(tester, find.byType(SolarDialog), 'dialog');
  own['actions'] = {'drawn': true, 'layers': measureButtonGroup(tester)};
  for (final layer in ['close', 'imageClose']) {
    final at = find.byKey(Key('dialog.$layer'));
    if (at.evaluate().isEmpty) continue;
    // Where the dialog places it, as SolarLayers keyed it, and its look as the Icon Button's.
    final place = own[layer] ?? const {};
    final layers = measureIconButtonAt(tester, at);
    layers['root'] = {
      ...?layers['root'],
      for (final edge in ['x', 'y', 'right', 'bottom'])
        if (place[edge] != null) edge: place[edge],
    };
    own[layer] = {'drawn': true, 'layers': layers};
  }
  return own;
}
