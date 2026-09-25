import 'package:flutter/material.dart';
import 'package:solar_flutter/solar_flutter.dart';

import 'probes.dart';

/// SolarNumberInput in one oracle variant: Figma's words, its label and helper, and its number, 0,
/// by the stepper the variant draws; forced into a state through [states].
Widget buildNumberInput(
  Map<String, dynamic> v,
  WidgetStatesController states, [
  Map<String, dynamic>? _,
]) {
  final props = v['props'] as Map<String, dynamic>;
  return SolarNumberInput(
    size: enumNamed(SolarNumberInputSize.values, props['size'] as String),
    stepper: enumNamed(
      SolarNumberInputStepper.values,
      props['stepper'] as String,
    ),
    enabled: !(props['disabled'] as bool),
    error: props['error'] as bool,
    label: 'Label',
    mandatory: true,
    helper: 'Helper text',
    value: 0,
    onChanged: (_) {},
    statesController: states,
  );
}
