import 'package:flutter/material.dart';
import 'package:solar_flutter/solar_flutter.dart';

import 'probes.dart';

/// SolarContainer in one oracle variant, named as the web case is: a line of words, as wide as
/// Figma draws it. It has no states.
Widget buildContainer(
  Map<String, dynamic> v,
  WidgetStatesController _, [
  Map<String, dynamic>? _,
]) {
  final props = v['props'] as Map<String, dynamic>;
  return SizedBox(
    width: 440,
    child: SolarContainer(
      type: enumNamed(
        SolarContainerType.values,
        props['type'] as String,
        (t) => t.figma,
      ),
      children: const [Text('Content')],
    ),
  );
}
