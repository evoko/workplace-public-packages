import 'package:flutter_test/flutter_test.dart';
import 'package:solar_flutter/solar_flutter.dart';

import '../harness.dart';
import '../layers.dart';

const paginationEllipsisCase = VisualCase(
  build: buildPaginationEllipsis,
  measure: measurePaginationEllipsis,
);

/// Its layers, as SolarLayers keyed them (layers.dart).
Layers measurePaginationEllipsis(WidgetTester tester) => measureLayers(
  tester,
  find.byType(SolarPaginationEllipsis),
  'paginationEllipsis',
);
