import 'package:flutter/material.dart';
import 'package:solar_flutter/solar_flutter.dart';

import 'probes.dart';

/// SolarTooltip in one oracle variant, named as the web case is: each size and position with
/// Figma's word, the bubble alone.
Widget buildTooltip(
  Map<String, dynamic> v,
  WidgetStatesController _, [
  Map<String, dynamic>? _,
]) {
  final props = v['props'] as Map<String, dynamic>;
  return SolarTooltip(
    message: 'Label',
    size: enumNamed(SolarTooltipSize.values, props['size'] as String),
    position: enumNamed(
      SolarTooltipPosition.values,
      props['position'] as String,
    ),
  );
}
