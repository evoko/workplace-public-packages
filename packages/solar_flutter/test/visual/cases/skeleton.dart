import 'package:flutter_test/flutter_test.dart';
import 'package:solar_flutter/solar_flutter.dart';

import '../harness.dart';
import '../layers.dart';

const skeletonCase = VisualCase(build: buildSkeleton, measure: measureSkeleton);

/// The placeholder, as SolarLayers keyed it (layers.dart); its pulse is not measured.
Layers measureSkeleton(WidgetTester tester) =>
    measureLayers(tester, find.byType(SolarSkeleton), 'skeleton');
