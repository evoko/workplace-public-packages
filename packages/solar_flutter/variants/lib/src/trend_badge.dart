import 'package:flutter/material.dart';
import 'package:solar_flutter/solar_flutter.dart';

import 'probes.dart';

/// SolarTrendBadge in one oracle variant, labelled as the web case is. It has no states.
Widget buildTrendBadge(
  Map<String, dynamic> v,
  WidgetStatesController _, [
  Map<String, dynamic>? _,
]) {
  final props = v['props'] as Map<String, dynamic>;
  return SolarTrendBadge(
    type: enumNamed(SolarTrendBadgeType.values, props['type'] as String),
    size: enumNamed(SolarTrendBadgeSize.values, props['size'] as String),
    label: props['type'] as String,
  );
}
