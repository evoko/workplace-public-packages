import 'package:flutter/material.dart';
import 'package:solar_flutter/solar_flutter.dart';

import 'probes.dart';

/// SolarTimeAxisLabel in one oracle variant, named as the web case is: each emphasis and density
/// with Figma's hour.
Widget buildTimeAxisLabel(
  Map<String, dynamic> v,
  WidgetStatesController _, [
  Map<String, dynamic>? _,
]) {
  final props = v['props'] as Map<String, dynamic>;
  return SolarTimeAxisLabel(
    label: '9 AM',
    emphasis: enumNamed(
      SolarTimeAxisLabelEmphasis.values,
      props['emphasis'] as String,
      (e) => e.figma,
    ),
    density: enumNamed(
      SolarTimeAxisLabelDensity.values,
      props['density'] as String,
    ),
  );
}
