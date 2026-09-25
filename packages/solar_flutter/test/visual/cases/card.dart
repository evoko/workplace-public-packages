import 'package:flutter_test/flutter_test.dart';
import 'package:solar_flutter/solar_flutter.dart';

import '../harness.dart';
import '../layers.dart';

const cardCase = VisualCase(build: buildCard, measure: measureCard);

/// The card and its parts, as SolarLayers keyed them (layers.dart); its Tag is measured as the
/// Tag check measures one.
Layers measureCard(WidgetTester tester) =>
    measureLayers(tester, find.byType(SolarCard), 'card');
