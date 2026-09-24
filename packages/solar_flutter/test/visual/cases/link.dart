import 'package:flutter_test/flutter_test.dart';
import 'package:solar_flutter/solar_flutter.dart';

import '../harness.dart';
import '../layers.dart';

const linkCase = VisualCase(build: buildLink, measure: measureLink);

/// The link's words and icons, as SolarLayers keyed them (layers.dart).
Layers measureLink(WidgetTester tester) =>
    measureLayers(tester, find.byType(SolarLink), 'link');
