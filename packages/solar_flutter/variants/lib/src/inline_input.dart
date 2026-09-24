import 'package:flutter/material.dart';
import 'package:solar_flutter/solar_flutter.dart';

/// SolarInlineInput in one oracle variant: Figma's value, started in edit mode where Figma draws
/// it editing (focused, filled, in error), its input focused for the focused one; forced into a
/// state through [states].
Widget buildInlineInput(
  Map<String, dynamic> v,
  WidgetStatesController states, [
  Map<String, dynamic>? _,
]) {
  final props = v['props'] as Map<String, dynamic>;
  final content = ((v['content'] as List?) ?? const []).cast<String>();
  final focus = v['state'] == 'focus';
  return SolarInlineInput(
    // A key per variant, so each starts afresh in its own mode.
    key: ValueKey(v['figma']),
    disabled: props['disabled'] as bool,
    error: props['error'] as bool,
    value: 'Current value',
    onConfirm: (_) => false,
    label: 'Value',
    defaultEditing:
        focus || content.contains('defaultEditing') || props['error'] as bool,
    statesController: states,
  );
}
