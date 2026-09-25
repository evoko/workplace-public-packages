import 'package:flutter/material.dart';
import 'package:solar_flutter/solar_flutter.dart';

import 'probes.dart';

/// SolarPasswordInput in one oracle variant: Figma's words, its label, its helper, and its words
/// held where it is filled (the oracle's content) and shown as the placeholder otherwise; the
/// forgot-password link where Figma draws one; forced into a state through [states].
Widget buildPasswordInput(
  Map<String, dynamic> v,
  WidgetStatesController states, [
  Map<String, dynamic>? _,
]) {
  final props = v['props'] as Map<String, dynamic>;
  final layers = v['layers'] as Map<String, dynamic>;
  final content = ((v['content'] as List?) ?? const []).cast<String>();
  final forgot = (layers['forgotPassword'] as Map<String, dynamic>?)?['hidden'];
  return SolarPasswordInput(
    size: enumNamed(SolarPasswordInputSize.values, props['size'] as String),
    enabled: !(props['disabled'] as bool),
    error: props['error'] as bool,
    label: 'Password',
    mandatory: true,
    helper: 'Helper text',
    forgotPassword: forgot == true ? null : 'Forgot password?',
    onForgotPassword: () {},
    controller: TextEditingController(
      text: content.contains('value') ? 'password' : '',
    ),
    placeholder: '•••••••••',
    statesController: states,
  );
}
