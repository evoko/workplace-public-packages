import 'package:flutter_test/flutter_test.dart';
import 'package:solar_flutter/solar_flutter.dart';

import '../harness.dart';
import '../layers.dart';

const dataLegendCase = VisualCase(
  build: buildDataLegend,
  measure: measureDataLegend,
);

/// The legend and its first item, as SolarLayers keyed them (layers.dart), its swatch as the
/// StatusIndicator check measures one.
Layers measureDataLegend(WidgetTester tester) =>
    measureLayers(tester, find.byType(SolarDataLegend), 'dataLegend');
