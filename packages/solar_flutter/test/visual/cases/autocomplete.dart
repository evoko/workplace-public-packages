import 'package:flutter_test/flutter_test.dart';
import 'package:solar_flutter/solar_flutter.dart';

import '../harness.dart';
import '../layers.dart';

const autocompleteCase = VisualCase(
  build: buildAutocomplete,
  measure: measureAutocomplete,
);

/// The field and its parts, as SolarLayers keyed them (layers.dart).
Layers measureAutocomplete(WidgetTester tester) => measureLayers(
  tester,
  find.byWidgetPredicate((w) => w is SolarAutocomplete),
  'autocomplete',
);
