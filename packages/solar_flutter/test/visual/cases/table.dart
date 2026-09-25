import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:solar_flutter/solar_flutter.dart';

import '../harness.dart';
import '../layers.dart';

const tableCase = VisualCase(build: buildTable, measure: measureTable);

/// The table and its parts, as SolarLayers keyed them (layers.dart); its header row, and its first
/// row by its layer, measured as the Row check measures one, each with the first cell it holds.
Layers measureTable(WidgetTester tester) {
  final table = find.byType(SolarTable);
  final own = measureLayers(tester, table, 'table');
  final header = find.byKey(const Key('table.header'));
  final row = find.byKey(const Key('row'));
  if (row.evaluate().isNotEmpty) {
    own['row'] = {'drawn': true, 'layers': measureLayers(tester, row, 'row')};
  }
  for (final (layer, at) in [('header', header), ('row', row)]) {
    final layers = own[layer]?['layers'];
    if (layers is! Layers) continue;
    final cell = find
        .descendant(of: at, matching: find.byKey(const Key('columnItem')))
        .first;
    layers['columnItem'] = {
      'drawn': true,
      'layers': measureLayers(tester, cell, 'columnItem'),
    };
  }
  return own;
}
