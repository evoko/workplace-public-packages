import 'package:flutter/material.dart';
import 'package:solar_flutter/solar_flutter.dart';

import 'probes.dart';

/// SolarSparkline in one oracle variant, named as the web case is: each trend and size with no
/// data, Figma's sample line, which the check compares as Figma draws it.
Widget buildSparkline(
  Map<String, dynamic> v,
  WidgetStatesController _, [
  Map<String, dynamic>? _,
]) {
  final props = v['props'] as Map<String, dynamic>;
  return SolarSparkline(
    trend: enumNamed(SolarSparklineTrend.values, props['trend'] as String),
    size: enumNamed(SolarSparklineSize.values, props['size'] as String),
    semanticLabel: 'Trend',
  );
}
