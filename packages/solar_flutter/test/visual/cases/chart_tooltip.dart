import 'package:flutter_test/flutter_test.dart';
import 'package:solar_flutter/solar_flutter.dart';

import '../harness.dart';
import '../layers.dart';

const chartTooltipCase = VisualCase(
  build: buildChartTooltip,
  measure: measureChartTooltip,
);

/// The surface, its title and its first row, as SolarLayers keyed them (layers.dart), its swatch
/// as the StatusIndicator check measures one.
Layers measureChartTooltip(WidgetTester tester) =>
    measureLayers(tester, find.byType(SolarChartTooltip), 'chartTooltip');
