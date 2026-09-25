import 'package:flutter_test/flutter_test.dart';
import 'package:solar_flutter/solar_flutter.dart';

import '../harness.dart';
import '../layers.dart';

const imageCardCase = VisualCase(
  build: buildImageCard,
  measure: measureImageCard,
);

/// The tile and its parts, as SolarLayers keyed them (layers.dart); its Checkbox is measured as
/// the Checkbox check measures one.
Layers measureImageCard(WidgetTester tester) =>
    measureLayers(tester, find.byType(SolarImageCard), 'imageCard');
