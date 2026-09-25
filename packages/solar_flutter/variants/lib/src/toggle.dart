import 'package:flutter/material.dart';
import 'package:solar_flutter/solar_flutter.dart';

/// SolarToggle in one oracle variant, named as the web case is; given onChanged, so a hover or
/// focus is forced through [states].
Widget buildToggle(
  Map<String, dynamic> v,
  WidgetStatesController states, [
  Map<String, dynamic>? _,
]) {
  final props = v['props'] as Map<String, dynamic>;
  return SolarToggle(
    selected: props['selected'] as bool,
    onChanged: props['disabled'] as bool ? null : (_) {},
    semanticLabel: 'Setting',
    statesController: states,
  );
}
