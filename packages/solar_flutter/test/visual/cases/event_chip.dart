import 'package:flutter_test/flutter_test.dart';
import 'package:solar_flutter/solar_flutter.dart';

import '../harness.dart';
import '../layers.dart';

const eventChipCase = VisualCase(
  build: buildEventChip,
  measure: measureEventChip,
);

/// The chip, its stripe and its words, as SolarLayers keyed them (layers.dart).
Layers measureEventChip(WidgetTester tester) =>
    measureLayers(tester, find.byType(SolarEventChip), 'eventChip');
