import 'package:flutter/material.dart';
import 'package:solar_flutter/solar_flutter.dart';

import 'probes.dart';

/// SolarPaginationNav in one oracle variant, named as the web case is: the arrow in Figma's
/// direction; given onPressed, so a hover, press or focus is forced through [states].
Widget buildPaginationNav(
  Map<String, dynamic> v,
  WidgetStatesController states, [
  Map<String, dynamic>? _,
]) {
  final props = v['props'] as Map<String, dynamic>;
  return SolarPaginationNav(
    direction: enumNamed(
      SolarPaginationNavDirection.values,
      props['direction'] as String,
    ),
    disabled: props['disabled'] as bool,
    onPressed: () {},
    statesController: states,
  );
}
