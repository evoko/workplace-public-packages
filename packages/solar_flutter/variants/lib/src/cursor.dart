import 'package:flutter/material.dart';
import 'package:solar_flutter/solar_flutter.dart';

import 'probes.dart';

/// SolarCursor in one oracle variant. It has no states.
Widget buildCursor(
  Map<String, dynamic> v,
  WidgetStatesController _, [
  Map<String, dynamic>? _,
]) {
  final props = v['props'] as Map<String, dynamic>;
  return SolarCursor(
    type: enumNamed(
      SolarCursorType.values,
      props['type'] as String,
      (v) => v.figma,
    ),
  );
}
