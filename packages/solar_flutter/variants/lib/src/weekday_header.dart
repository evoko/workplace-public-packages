import 'package:flutter/material.dart';
import 'package:solar_flutter/solar_flutter.dart';

import 'probes.dart';

/// SolarWeekdayHeader in one oracle variant, named as the web case is: each emphasis with Figma's
/// weekday, in Figma's 160 (it fills its column).
Widget buildWeekdayHeader(
  Map<String, dynamic> v,
  WidgetStatesController _, [
  Map<String, dynamic>? _,
]) {
  final props = v['props'] as Map<String, dynamic>;
  return SizedBox(
    width: 160,
    child: SolarWeekdayHeader(
      label: 'Mon',
      emphasis: enumNamed(
        SolarWeekdayHeaderEmphasis.values,
        props['emphasis'] as String,
        (e) => e.figma,
      ),
    ),
  );
}
