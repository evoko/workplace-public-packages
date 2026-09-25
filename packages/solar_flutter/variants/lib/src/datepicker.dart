import 'package:flutter/material.dart';
import 'package:solar_flutter/solar_flutter.dart';

import 'probes.dart';

/// SolarDatePicker in one oracle variant, named as the web case is: every part shown, with Figma's
/// own date, holding it where it is filled (the oracle's content), and showing its words as the
/// placeholder otherwise; forced into a state through [states].
Widget buildDatePicker(
  Map<String, dynamic> v,
  WidgetStatesController states, [
  Map<String, dynamic>? _,
]) {
  final props = v['props'] as Map<String, dynamic>;
  final content = ((v['content'] as List?) ?? const []).cast<String>();
  return SolarDatePicker(
    size: enumNamed(SolarDatePickerSize.values, props['size'] as String),
    enabled: !(props['disabled'] as bool),
    error: props['error'] as bool,
    label: 'Select Date',
    mandatory: true,
    helper: 'Helper text',
    value: content.contains('value') ? DateTime(2026, 5, 11) : null,
    onDateChanged: (_) {},
    placeholder: '05/11/2026',
    statesController: states,
  );
}
