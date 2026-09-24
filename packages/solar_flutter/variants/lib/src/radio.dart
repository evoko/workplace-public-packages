import 'package:flutter/material.dart';
import 'package:solar_flutter/solar_flutter.dart';

/// SolarRadio in one oracle variant: in a group, as a radio always is, whose value is this one's
/// where Figma draws it checked; named as the web case is, and forced into a state through
/// [states].
Widget buildRadio(
  Map<String, dynamic> v,
  WidgetStatesController states, [
  Map<String, dynamic>? _,
]) {
  final props = v['props'] as Map<String, dynamic>;
  return RadioGroup<String>(
    groupValue: props['checked'] as bool ? 'option' : null,
    onChanged: (_) {},
    child: SolarRadio<String>(
      value: 'option',
      disabled: props['disabled'] as bool,
      semanticLabel: 'Option',
      statesController: states,
    ),
  );
}
