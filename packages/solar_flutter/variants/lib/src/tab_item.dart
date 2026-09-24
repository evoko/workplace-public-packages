import 'package:flutter/material.dart';
import 'package:solar_flutter/solar_flutter.dart';

import 'probes.dart';

/// SolarTabItem in one oracle variant, named as the web case is: on its own, every slot shown (both
/// icons probes, and a count); given onPressed, so a hover or focus is forced through [states].
Widget buildTabItem(
  Map<String, dynamic> v,
  WidgetStatesController states, [
  Map<String, dynamic>? _,
]) {
  final props = v['props'] as Map<String, dynamic>;
  return SolarTabItem(
    size: enumNamed(SolarTabItemSize.values, props['size'] as String),
    selected: props['selected'] as bool,
    disabled: props['disabled'] as bool,
    label: 'Tab',
    leadingIcon: const IconProbe(),
    trailingIcon: const IconProbe(),
    count: 3,
    onPressed: () {},
    statesController: states,
  );
}
