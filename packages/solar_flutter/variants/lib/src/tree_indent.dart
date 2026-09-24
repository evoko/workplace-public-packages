import 'package:flutter/material.dart';
import 'package:solar_flutter/solar_flutter.dart';

import 'probes.dart';

/// SolarTreeIndent in one oracle variant. It has no states.
Widget buildTreeIndent(
  Map<String, dynamic> v,
  WidgetStatesController _, [
  Map<String, dynamic>? _,
]) {
  final props = v['props'] as Map<String, dynamic>;
  return SolarTreeIndent(
    depth: enumNamed(
      SolarTreeIndentDepth.values,
      props['depth'] as String,
      (v) => v.figma,
    ),
  );
}
