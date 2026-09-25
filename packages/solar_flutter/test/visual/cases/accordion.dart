import 'package:flutter_test/flutter_test.dart';
import 'package:solar_flutter/solar_flutter.dart';

import '../harness.dart';
import '../layers.dart';

const accordionCase = VisualCase(
  build: buildAccordion,
  measure: measureAccordion,
);

/// The item and its parts, as SolarLayers keyed them (layers.dart); its nested header, the
/// collapsed item, is measured as the Accordion check measures one.
Layers measureAccordion(WidgetTester tester) =>
    measureLayers(tester, find.byType(SolarAccordion), 'accordion');
