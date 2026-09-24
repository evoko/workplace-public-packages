import 'package:flutter/material.dart';
import 'package:solar_flutter/solar_flutter.dart';

import 'probes.dart';

/// SolarBreadcrumbItem in one oracle variant, named as the web case is: Figma's words, a link
/// given onPressed, so a hover is forced through [states].
Widget buildBreadcrumbItem(
  Map<String, dynamic> v,
  WidgetStatesController states, [
  Map<String, dynamic>? _,
]) {
  final props = v['props'] as Map<String, dynamic>;
  return SolarBreadcrumbItem(
    type: enumNamed(SolarBreadcrumbItemType.values, props['type'] as String),
    disabled: props['disabled'] as bool,
    label: 'Label',
    onPressed: () {},
    statesController: states,
  );
}
