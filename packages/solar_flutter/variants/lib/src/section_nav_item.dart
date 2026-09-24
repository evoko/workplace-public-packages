import 'package:flutter/material.dart';
import 'package:solar_flutter/solar_flutter.dart';

import 'probes.dart';

/// SolarSectionNavItem in one oracle variant, named as the web case is: Figma's label, and its
/// icon a probe; given onPressed, so a hover or focus is forced through [states].
Widget buildSectionNavItem(
  Map<String, dynamic> v,
  WidgetStatesController states, [
  Map<String, dynamic>? _,
]) {
  final props = v['props'] as Map<String, dynamic>;
  return SolarSectionNavItem(
    selected: props['selected'] as bool,
    disabled: props['disabled'] as bool,
    label: 'Label',
    icon: const IconProbe(),
    onPressed: () {},
    statesController: states,
  );
}
