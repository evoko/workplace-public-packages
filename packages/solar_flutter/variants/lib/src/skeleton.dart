import 'package:flutter/material.dart';
import 'package:solar_flutter/solar_flutter.dart';

import 'probes.dart';

/// SolarSkeleton in one oracle variant. It has no states.
Widget buildSkeleton(
  Map<String, dynamic> v,
  WidgetStatesController _, [
  Map<String, dynamic>? _,
]) {
  final props = v['props'] as Map<String, dynamic>;
  return SolarSkeleton(
    type: enumNamed(SolarSkeletonType.values, props['type'] as String),
    size: enumNamed(SolarSkeletonSize.values, props['size'] as String),
  );
}
