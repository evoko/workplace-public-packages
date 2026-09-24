import 'package:flutter/material.dart';
import 'package:solar_flutter/solar_flutter.dart';

/// SolarCheckbox in one oracle variant, named as the web case is; given onChanged, so a hover or
/// focus is forced through [states].
Widget buildCheckbox(
  Map<String, dynamic> v,
  WidgetStatesController states, [
  Map<String, dynamic>? _,
]) {
  final props = v['props'] as Map<String, dynamic>;
  return SolarCheckbox(
    checked: props['checked'] as bool,
    mixed: props['mixed'] as bool,
    disabled: props['disabled'] as bool,
    onChanged: (_) {},
    semanticLabel: 'Option',
    statesController: states,
  );
}
