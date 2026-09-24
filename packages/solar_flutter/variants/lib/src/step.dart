import 'package:flutter/material.dart';
import 'package:solar_flutter/solar_flutter.dart';

import 'probes.dart';

/// SolarStep in one oracle variant, named as the web case is: Figma's words and number. It has no
/// states of its own.
Widget buildStep(
  Map<String, dynamic> v,
  WidgetStatesController _, [
  Map<String, dynamic>? _,
]) {
  final props = v['props'] as Map<String, dynamic>;
  return SolarStep(
    status: enumNamed(SolarStepStatus.values, props['status'] as String),
    type: enumNamed(SolarStepType.values, props['type'] as String),
    label: 'Step',
    number: 1,
  );
}
