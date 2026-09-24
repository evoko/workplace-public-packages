import 'package:flutter/material.dart';
import 'package:solar_flutter/solar_flutter.dart';

import 'probes.dart';

/// SolarTimestamp in one oracle variant, with Figma's own sample words. It has no states.
Widget buildTimestamp(
  Map<String, dynamic> v,
  WidgetStatesController _, [
  Map<String, dynamic>? _,
]) {
  final props = v['props'] as Map<String, dynamic>;
  return SolarTimestamp(
    format: enumNamed(SolarTimestampFormat.values, props['format'] as String),
    size: enumNamed(SolarTimestampSize.values, props['size'] as String),
    emphasis: enumNamed(
      SolarTimestampEmphasis.values,
      props['emphasis'] as String,
      (v) => v.figma,
    ),
    text: '2 min ago',
    detail: 'Apr 18, 2026, 14:32',
  );
}
