import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:solar_flutter/solar_flutter.dart';

import '../harness.dart';

/// SolarSpinner's layers where it is drawn, alone or inside another component.
Layers spinnerLayers(WidgetTester tester, Finder at) {
  final ring = tester.widget<CircularProgressIndicator>(
    find.descendant(of: at, matching: find.byType(CircularProgressIndicator)),
  );
  final size = tester.getSize(at);
  return {
    // SolarSpinner draws no frame of its own: the root is Figma's transparent, borderless auto
    // layout, so it is compared as exactly that rather than skipped.
    'root': {
      'background': Colors.transparent,
      'borderWidth': 0.0,
      'radius': 0.0,
      'shadow': const <BoxShadow>[],
      'paddingTop': 0.0,
      'paddingRight': 0.0,
      'paddingBottom': 0.0,
      'paddingLeft': 0.0,
      'gap': 0.0,
    },
    'spinnerRing': {
      'background': Colors.transparent,
      'borderWidth': 0.0,
      'radius': 0.0,
      'width': size.width,
      'height': size.height,
    },
    'track': {
      'background': Colors.transparent,
      'borderColor': ring.backgroundColor,
      'borderWidth': ring.strokeWidth,
    },
    'indicator': {
      'background': Colors.transparent,
      'borderColor': ring.color,
      'borderWidth': ring.strokeWidth,
    },
  };
}

/// A pumped SolarSpinner's layers.
Layers measureSpinner(WidgetTester tester) =>
    spinnerLayers(tester, find.byType(SolarSpinner));

const spinnerCase = VisualCase(
  build: buildSpinner,
  measure: measureSpinner,
  layersAt: spinnerLayers,
);
