import 'package:flutter/material.dart';
import 'package:solar_flutter/solar_flutter.dart';

import 'probes.dart';

/// SolarDatePickerDayCell in one oracle variant, named as the web case is: a day in the variant's
/// state and range role; given onPressed, so a hover or focus is forced through [states].
Widget buildDatePickerDayCell(
  Map<String, dynamic> v,
  WidgetStatesController states, [
  Map<String, dynamic>? _,
]) {
  final props = v['props'] as Map<String, dynamic>;
  return SolarDatePickerDayCell(
    selected: props['selected'] as bool,
    today: props['today'] as bool,
    filled: props['filled'] as bool,
    error: props['error'] as bool,
    rangeRole: enumNamed(
      SolarDatePickerDayCellRangeRole.values,
      props['rangeRole'] as String,
      (r) => r.figma,
    ),
    label: '24',
    semanticLabel: '24 April 2026',
    onPressed: props['disabled'] as bool ? null : () {},
    statesController: states,
  );
}
