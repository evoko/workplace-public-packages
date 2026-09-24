import 'package:flutter/material.dart';
import 'package:solar_flutter/solar_flutter.dart';

import 'probes.dart';

/// SolarTextInput in one oracle variant, every part shown with Figma's own words: holding Figma's
/// "Text" where it is filled (the oracle's content), and showing it as the placeholder otherwise;
/// both icons probes; forced into a state through [states].
Widget buildTextInput(
  Map<String, dynamic> v,
  WidgetStatesController states, [
  Map<String, dynamic>? _,
]) {
  final props = v['props'] as Map<String, dynamic>;
  final content = ((v['content'] as List?) ?? const []).cast<String>();
  return SolarTextInput(
    size: enumNamed(SolarTextInputSize.values, props['size'] as String),
    disabled: props['disabled'] as bool,
    error: props['error'] as bool,
    label: 'Label',
    mandatory: true,
    helper: 'Helper text',
    leadingIcon: const IconProbe(),
    trailingIcon: const IconProbe(),
    controller: TextEditingController(
      text: content.contains('value') ? 'Text' : '',
    ),
    placeholder: 'Text',
    statesController: states,
  );
}
