import 'package:flutter/material.dart';
import 'package:solar_flutter/solar_flutter.dart';

/// SolarSplitDropdown, named as the web case is: each zone holding content as tall as Figma's
/// (48), the box as wide as Figma draws it. It has no variants and no states.
Widget buildSplitDropdown(
  Map<String, dynamic> _,
  WidgetStatesController _, [
  Map<String, dynamic>? _,
]) => const SizedBox(
  width: 680,
  child: SolarSplitDropdown(
    top: SizedBox(height: 48),
    lower: SizedBox(height: 48),
  ),
);
