import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:solar_flutter/solar_flutter.dart';

import '../harness.dart';
import '../layers.dart';
import 'button_group.dart';
import 'icon_button.dart';

const splitDialogCase = VisualCase(
  build: buildSplitDialog,
  measure: measureSplitDialog,
);

/// The surface and its parts, as SolarLayers keyed them (layers.dart); its close button as the Icon
/// Button check measures one, and its Button Group, where the cta draws it, as the Button Group
/// check measures one.
Layers measureSplitDialog(WidgetTester tester) {
  final own = measureLayers(
    tester,
    find.byType(SolarSplitDialog),
    'splitDialog',
  );
  for (final layer in ['actions', 'actionsRegular']) {
    if (find.byKey(Key('splitDialog.$layer')).evaluate().isEmpty) continue;
    own[layer] = {'drawn': true, 'layers': measureButtonGroup(tester)};
  }
  final close = find.byKey(const Key('splitDialog.close'));
  if (close.evaluate().isNotEmpty) {
    own['close'] = {
      'drawn': true,
      'layers': measureIconButtonAt(tester, close),
    };
  }
  return own;
}
