import 'package:flutter/material.dart';
import 'package:solar_flutter/solar_flutter.dart';

import 'probes.dart';

/// SolarRowExpand in one oracle variant. It has no states.
Widget buildRowExpand(
  Map<String, dynamic> v,
  WidgetStatesController _, [
  Map<String, dynamic>? _,
]) {
  final props = v['props'] as Map<String, dynamic>;
  return SolarRowExpand(
    type: enumNamed(
      SolarRowExpandType.values,
      props['type'] as String,
      (v) => v.figma,
    ),
  );
}
