import 'package:flutter_test/flutter_test.dart';
import 'package:solar_flutter/solar_flutter.dart';

import '../harness.dart';
import '../layers.dart';
import 'button_group.dart';

const confirmationDialogCase = VisualCase(
  build: buildConfirmationDialog,
  measure: measureConfirmationDialog,
);

/// The surface and its words, as SolarLayers keyed them (layers.dart); its Button Group as the
/// Button Group check measures one, its cancel and confirm Buttons found by their words.
Layers measureConfirmationDialog(WidgetTester tester) {
  final own = measureLayers(
    tester,
    find.byType(SolarConfirmationDialog),
    'confirmationDialog',
  );
  own['buttonGroup'] = {
    'drawn': true,
    'layers': measureButtonGroup(
      tester,
      buttons: {
        'tertiaryCTA': find.widgetWithText(SolarButton, 'Cancel'),
        'secondaryCTA': find.widgetWithText(SolarButton, 'Continue'),
      },
    ),
  };
  return own;
}
