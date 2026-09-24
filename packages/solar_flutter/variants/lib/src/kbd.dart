import 'package:flutter/material.dart';
import 'package:solar_flutter/solar_flutter.dart';

import 'probes.dart';

/// SolarKbd in one oracle variant, with Figma's own sample key. It has no states.
Widget buildKbd(
  Map<String, dynamic> v,
  WidgetStatesController _, [
  Map<String, dynamic>? _,
]) {
  final props = v['props'] as Map<String, dynamic>;
  return SolarKbd(
    type: enumNamed(
      SolarKbdType.values,
      props['type'] as String,
      (v) => v.figma,
    ),
    label: '⌘K',
  );
}
