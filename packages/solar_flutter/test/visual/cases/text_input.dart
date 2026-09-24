import 'package:flutter_test/flutter_test.dart';
import 'package:solar_flutter/solar_flutter.dart';

import '../harness.dart';
import '../layers.dart';

const textInputCase = VisualCase(
  build: buildTextInput,
  measure: measureTextInput,
);

/// The label, the field, its words and icons, and the helper, as SolarLayers keyed them
/// (layers.dart); the words in the style the TextField paints them in.
Layers measureTextInput(WidgetTester tester) =>
    measureLayers(tester, find.byType(SolarTextInput), 'textInput');
