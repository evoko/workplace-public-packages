import 'package:flutter_test/flutter_test.dart';
import 'package:solar_flutter/solar_flutter.dart';

import '../harness.dart';
import '../layers.dart';
import 'button_group.dart';

const coachmarkCase = VisualCase(
  build: buildCoachmark,
  measure: measureCoachmark,
);

/// The card, its words and its connector, as SolarLayers keyed them (layers.dart), its Node End
/// among them; its Button Group as the Button Group check measures one.
Layers measureCoachmark(WidgetTester tester) {
  final own = measureLayers(tester, find.byType(SolarCoachmark), 'coachmark');
  own['actions'] = {'drawn': true, 'layers': measureButtonGroup(tester)};
  return own;
}
