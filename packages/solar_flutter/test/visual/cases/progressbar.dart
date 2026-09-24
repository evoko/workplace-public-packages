import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

import '../harness.dart';

const progressBarCase = VisualCase(
  build: buildProgressBar,
  measure: measureProgressBar,
);

/// The track and the bar, as LinearProgressIndicator draws them. The bar's box is the control's
/// (the overlay's controlDraws), so it is its colour that is read.
Layers measureProgressBar(WidgetTester tester) {
  final at = find.byType(LinearProgressIndicator);
  final bar = tester.widget<LinearProgressIndicator>(at);
  final size = tester.getSize(at);
  final radius = (bar.borderRadius! as BorderRadius).topLeft.x;
  return {
    'root': {
      'background': bar.backgroundColor,
      'borderColor': Colors.transparent,
      'borderWidth': 0.0,
      'radius': radius,
      'shadow': const <BoxShadow>[],
      'width': size.width,
      'height': size.height,
    },
    'indicator': {
      'background': bar.color,
      'borderColor': Colors.transparent,
      'borderWidth': 0.0,
      'radius': radius,
    },
  };
}
