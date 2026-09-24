import 'package:flutter/material.dart';
import 'package:solar_flutter/solar_flutter.dart';

import 'probes.dart';

/// SolarProgressBar in one oracle variant, at the value Figma draws it at (its bar's share of the
/// track), in Figma's sample width. It has no states.
Widget buildProgressBar(
  Map<String, dynamic> v,
  WidgetStatesController _, [
  Map<String, dynamic>? _,
]) {
  final props = v['props'] as Map<String, dynamic>;
  final layers = v['layers'] as Map<String, dynamic>?;
  final track = ((layers?['root'] as Map?)?['width'] as num?) ?? 200;
  final bar = ((layers?['indicator'] as Map?)?['width'] as num?) ?? track / 2;
  return SizedBox(
    width: track.toDouble(),
    child: SolarProgressBar(
      value: bar / track,
      feedback: enumNamed(
        SolarProgressBarFeedback.values,
        props['feedback'] as String,
      ),
      semanticsLabel: 'Progress',
    ),
  );
}
