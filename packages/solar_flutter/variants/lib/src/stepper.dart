import 'package:flutter/material.dart';
import 'package:solar_flutter/solar_flutter.dart';

import 'probes.dart';

/// Figma's sample of each type: how many steps, and which is active.
const _samples = {
  'with label': (3, 1),
  'no label': (3, 1),
  'line': (5, 0),
  'line+text': (5, 1),
};

/// SolarStepper in one oracle variant, named as the web case is: Figma's steps for each type, named
/// "Step". It has no states of its own.
Widget buildStepper(
  Map<String, dynamic> v,
  WidgetStatesController _, [
  Map<String, dynamic>? _,
]) {
  final type = (v['props'] as Map<String, dynamic>)['type'] as String;
  final (n, active) = _samples[type]!;
  return SolarStepper(
    type: enumNamed(SolarStepperType.values, type, (t) => t.figma),
    steps: List.filled(n, 'Step'),
    activeStep: active,
  );
}
