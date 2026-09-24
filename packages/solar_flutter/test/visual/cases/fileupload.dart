import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:solar_flutter/solar_flutter.dart';

import '../harness.dart';
import '../layers.dart';
import 'button.dart';
import 'icon_button.dart';

const fileUploadCase = VisualCase(
  build: buildFileUpload,
  measure: measureFileUpload,
);

/// The label, the drop zone, its icon and file, and the helper, as SolarLayers keyed them
/// (layers.dart); Browse measured as the Button check measures one, replace and remove as the
/// Icon Button check does.
Layers measureFileUpload(WidgetTester tester) {
  final own = measureLayers(tester, find.byType(SolarFileUpload), 'fileUpload');
  final parts = {
    'button': measureButtonAt,
    'iconButton': measureIconButtonAt,
    'iconButton2': measureIconButtonAt,
  };
  for (final MapEntry(key: layer, value: measure) in parts.entries) {
    final at = find.byKey(Key('fileUpload.$layer'));
    own[layer] = at.evaluate().isEmpty
        ? {'drawn': false}
        : {'drawn': true, 'layers': measure(tester, at)};
  }
  return own;
}
