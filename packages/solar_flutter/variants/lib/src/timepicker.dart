import 'package:flutter/material.dart';
import 'package:solar_flutter/solar_flutter.dart';

import 'probes.dart';

/// SolarTimePicker in one oracle variant, named as the web case is: every part shown, with Figma's
/// own time, holding it where it is filled (the oracle's content), and showing its words as the
/// placeholder otherwise; forced into a state through [states].
Widget buildTimePicker(
  Map<String, dynamic> v,
  WidgetStatesController states, [
  Map<String, dynamic>? _,
]) {
  final props = v['props'] as Map<String, dynamic>;
  final content = ((v['content'] as List?) ?? const []).cast<String>();
  return SolarTimePicker(
    size: enumNamed(SolarTimePickerSize.values, props['size'] as String),
    enabled: !(props['disabled'] as bool),
    error: props['error'] as bool,
    label: 'Label',
    mandatory: true,
    helper: 'Helper text',
    value: content.contains('value')
        ? const TimeOfDay(hour: 0, minute: 0)
        : null,
    onTimeChanged: (_) {},
    placeholder: '12:00 AM',
    statesController: states,
  );
}
