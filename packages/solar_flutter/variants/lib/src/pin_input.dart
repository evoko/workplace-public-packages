import 'package:flutter/material.dart';
import 'package:solar_flutter/solar_flutter.dart';

import 'probes.dart';

/// SolarPINInput in one oracle variant: Figma's six cells and words, its code, 1 to 6, where it is
/// filled (the oracle's content), its placeholders otherwise, and its error's words where it is in
/// error; forced into a state through [states].
Widget buildPINInput(
  Map<String, dynamic> v,
  WidgetStatesController states, [
  Map<String, dynamic>? _,
]) {
  final props = v['props'] as Map<String, dynamic>;
  final content = ((v['content'] as List?) ?? const []).cast<String>();
  return SolarPINInput(
    size: enumNamed(SolarPINInputSize.values, props['size'] as String),
    enabled: !(props['disabled'] as bool),
    error: props['error'] as bool,
    label: 'Label',
    mandatory: true,
    helper: 'Helper text',
    errorMessage: 'Code is incorrect or expired.',
    controller: TextEditingController(
      text: content.contains('value') ? '123456' : '',
    ),
    statesController: states,
  );
}
