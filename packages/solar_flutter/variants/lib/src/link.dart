import 'package:flutter/material.dart';
import 'package:solar_flutter/solar_flutter.dart';

import 'probes.dart';

/// SolarLink in one oracle variant, both icons probes, with Figma's own words; given onPressed,
/// so a hover or press is forced through [states].
Widget buildLink(
  Map<String, dynamic> v,
  WidgetStatesController states, [
  Map<String, dynamic>? _,
]) {
  final props = v['props'] as Map<String, dynamic>;
  return SolarLink(
    size: enumNamed(SolarLinkSize.values, props['size'] as String),
    label: 'Link text',
    leadingIcon: const IconProbe(),
    trailingIcon: const IconProbe(),
    onPressed: props['disabled'] as bool ? null : () {},
    statesController: states,
  );
}
