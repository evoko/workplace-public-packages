import 'package:flutter/material.dart';
import 'package:solar_flutter/solar_flutter.dart';

import 'probes.dart';

/// SolarBar in one oracle variant, named as the web case is: each colour, in Figma's 32 × 80 (it
/// fills the box its chart gives it).
Widget buildBar(
  Map<String, dynamic> v,
  WidgetStatesController _, [
  Map<String, dynamic>? _,
]) {
  final props = v['props'] as Map<String, dynamic>;
  return SizedBox(
    width: 32,
    height: 80,
    child: SolarBar(
      color: enumNamed(
        SolarBarColor.values,
        props['color'] as String,
        (c) => c.figma,
      ),
    ),
  );
}
