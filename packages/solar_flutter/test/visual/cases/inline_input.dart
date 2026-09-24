import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:solar_flutter/solar_flutter.dart';

import '../harness.dart';
import '../layers.dart';
import 'icon_button.dart';

const inlineInputCase = VisualCase(
  build: buildInlineInput,
  measure: measureInlineInput,
);

/// The row and its value, as SolarLayers keyed them (layers.dart); its edit, Confirm and Cancel
/// buttons measured as the Icon Button check measures one, the edit button drawn only while it
/// is shown.
Layers measureInlineInput(WidgetTester tester) {
  final own = measureLayers(
    tester,
    find.byType(SolarInlineInput),
    'inlineInput',
  );
  for (final layer in ['iconButton', 'confirm', 'cancel']) {
    final at = find.byKey(Key('inlineInput.$layer'));
    if (at.evaluate().isEmpty) {
      own[layer] = {'drawn': false};
      continue;
    }
    final shown = tester
        .widgetList<Visibility>(
          find.descendant(of: at, matching: find.byType(Visibility)),
        )
        .every((v) => v.visible);
    own[layer] = {'drawn': shown, 'layers': measureIconButtonAt(tester, at)};
  }
  return own;
}
