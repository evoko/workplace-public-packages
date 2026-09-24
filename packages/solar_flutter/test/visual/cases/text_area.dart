import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:solar_flutter/solar_flutter.dart';

import '../harness.dart';
import '../layers.dart';
import 'icon_button.dart';

const textAreaCase = VisualCase(build: buildTextArea, measure: measureTextArea);

/// The label, the field, its words and the footer, as SolarLayers keyed them (layers.dart); its
/// Icon Buttons measured as the Icon Button check measures one, and placed from the field's edges.
Layers measureTextArea(WidgetTester tester) {
  final own = measureLayers(tester, find.byType(SolarTextArea), 'textArea');
  final field = tester.getRect(find.byKey(const Key('textArea.field')));
  for (final layer in ['cta', 'attachment']) {
    final at = find.byKey(Key('textArea.$layer'));
    if (at.evaluate().isEmpty) {
      own[layer] = {'drawn': false};
      continue;
    }
    final layers = measureIconButtonAt(tester, at);
    final box = tester.getRect(at);
    layers['root'] = {
      ...layers['root']!,
      'x': box.left - field.left,
      'y': box.top - field.top,
      'right': field.right - box.right,
      'bottom': field.bottom - box.bottom,
    };
    own[layer] = {'drawn': true, 'layers': layers};
  }
  return own;
}
