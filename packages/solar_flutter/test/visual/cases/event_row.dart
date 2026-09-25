import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:solar_flutter/solar_flutter.dart';

import '../harness.dart';
import '../layers.dart';

const eventRowCase = VisualCase(build: buildEventRow, measure: measureEventRow);

/// The row and its parts, as SolarLayers keyed them (layers.dart); its leading Avatar is measured
/// as the Avatar check measures one.
Layers measureEventRow(WidgetTester tester) {
  final own = measureLayers(tester, find.byType(SolarEventRow), 'eventRow');
  final at = find.byKey(const Key('eventRow.leading'));
  own['leading'] = at.evaluate().isEmpty
      ? {'drawn': false}
      : {'drawn': true, 'layers': measureLayers(tester, at, 'avatar')};
  return own;
}
