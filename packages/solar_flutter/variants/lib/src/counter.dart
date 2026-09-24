import 'package:flutter/material.dart';
import 'package:solar_flutter/solar_flutter.dart';

import 'probes.dart';

/// SolarCounter in one oracle variant: given onPressed, so it is a control of its own, and a hover
/// or press is forced through [states].
Widget buildCounter(
  Map<String, dynamic> v,
  WidgetStatesController states, [
  Map<String, dynamic>? _,
]) {
  final props = v['props'] as Map<String, dynamic>;
  return SolarCounter(
    type: enumNamed(SolarCounterType.values, props['type'] as String),
    disabled: props['disabled'] as bool,
    count: 3,
    onPressed: () {},
    statesController: states,
  );
}
