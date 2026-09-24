import 'package:flutter/widgets.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:solar_flutter/solar_flutter.dart';

import '../harness.dart';
import '../layers.dart';

const autocompleteOpenCase = VisualCase(
  build: buildAutocompleteOpen,
  measure: measureAutocompleteOpen,
);

/// The frame and the Autocomplete and Dropdown Menu it holds, as SolarLayers keyed them
/// (layers.dart), each measured as its own check measures one.
Layers measureAutocompleteOpen(WidgetTester tester) {
  final own = measureLayers(
    tester,
    find.byKey(const Key('autocompleteOpen')),
    'autocompleteOpen',
  );
  // The menu's heading and rows, keyed by their layers, measured into the menu's own layers.
  final menu = own['dropdownMenu']?['layers'] as Layers?;
  if (menu != null) {
    measureHeld(tester, find.byType(SolarDropdownMenu), menu, const {
      'dropdownItem': 'dropdownItem',
      'dropdownGroupLabel': 'dropdownGroupLabel',
    });
  }
  return own;
}
