import 'package:flutter_test/flutter_test.dart';
import 'package:solar_flutter/solar_flutter.dart';

import '../harness.dart';
import '../layers.dart';

const treeIndentCase = VisualCase(
  build: buildTreeIndent,
  measure: measureTreeIndent,
);

/// The indent and its units, as SolarLayers keyed them (layers.dart).
Layers measureTreeIndent(WidgetTester tester) =>
    measureLayers(tester, find.byType(SolarTreeIndent), 'treeIndent');
