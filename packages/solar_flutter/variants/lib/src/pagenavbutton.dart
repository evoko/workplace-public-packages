import 'package:flutter/material.dart';
import 'package:solar_flutter/solar_flutter.dart';

import 'probes.dart';

/// SolarPageNavButton in one oracle variant, named as the web case is: the button in Figma's
/// direction, with its words; given onPressed, so a hover, press or focus is forced through
/// [states].
Widget buildPageNavButton(
  Map<String, dynamic> v,
  WidgetStatesController states, [
  Map<String, dynamic>? _,
]) {
  final props = v['props'] as Map<String, dynamic>;
  return SolarPageNavButton(
    direction: enumNamed(
      SolarPageNavButtonDirection.values,
      props['direction'] as String,
    ),
    onPressed: props['disabled'] as bool ? null : () {},
    statesController: states,
  );
}
