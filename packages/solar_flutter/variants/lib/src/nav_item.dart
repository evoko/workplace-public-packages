import 'package:flutter/material.dart';
import 'package:solar_flutter/solar_flutter.dart';

import 'probes.dart';

/// SolarNavItem in one oracle variant, named as the web case is: Figma's label, and its icon a
/// probe, outlined and solid alike; given onPressed, so a hover is forced through [states].
Widget buildNavItem(
  Map<String, dynamic> v,
  WidgetStatesController states, [
  Map<String, dynamic>? _,
]) {
  final props = v['props'] as Map<String, dynamic>;
  return SolarNavItem(
    selected: props['selected'] as bool,
    expanded: props['expanded'] as bool,
    label: 'Label',
    iconOutline: const IconProbe(),
    iconSolid: const IconProbe(),
    onPressed: () {},
    statesController: states,
  );
}
