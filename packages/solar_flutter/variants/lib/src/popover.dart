import 'package:flutter/material.dart';
import 'package:solar_flutter/solar_flutter.dart';

import 'probes.dart';

/// SolarPopover in one oracle variant, named as the web case is: each size and placement with
/// Figma's words, the surface alone.
Widget buildPopover(
  Map<String, dynamic> v,
  WidgetStatesController _, [
  Map<String, dynamic>? _,
]) {
  final props = v['props'] as Map<String, dynamic>;
  return SolarPopover(
    title: 'Popover Title',
    body: 'Popover content goes here. This is a short description.',
    size: enumNamed(SolarPopoverSize.values, props['size'] as String),
    placement: enumNamed(
      SolarPopoverPlacement.values,
      props['placement'] as String,
    ),
  );
}
