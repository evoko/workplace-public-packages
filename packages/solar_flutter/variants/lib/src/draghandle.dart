import 'package:flutter/material.dart';
import 'package:solar_flutter/solar_flutter.dart';

import 'probes.dart';

/// SolarDragHandle in one oracle variant, forced into a state through [states].
Widget buildDragHandle(
  Map<String, dynamic> v,
  WidgetStatesController states, [
  Map<String, dynamic>? _,
]) {
  final props = v['props'] as Map<String, dynamic>;
  return SolarDragHandle(
    size: enumNamed(SolarDragHandleSize.values, props['size'] as String),
    disabled: props['disabled'] as bool,
    statesController: states,
  );
}
