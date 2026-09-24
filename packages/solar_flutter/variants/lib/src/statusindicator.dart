import 'package:flutter/material.dart';
import 'package:solar_flutter/solar_flutter.dart';

import 'probes.dart';

/// SolarStatusIndicator in one oracle variant, labelled as the web case is. It has no states.
Widget buildStatusIndicator(
  Map<String, dynamic> v,
  WidgetStatesController _, [
  Map<String, dynamic>? _,
]) {
  final props = v['props'] as Map<String, dynamic>;
  return SolarStatusIndicator(
    type: enumNamed(SolarStatusIndicatorType.values, props['type'] as String),
    size: enumNamed(SolarStatusIndicatorSize.values, props['size'] as String),
    label: props['type'] as String,
  );
}
