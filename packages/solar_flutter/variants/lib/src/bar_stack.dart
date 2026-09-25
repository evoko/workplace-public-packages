import 'package:flutter/material.dart';
import 'package:solar_flutter/solar_flutter.dart';

import 'probes.dart';

/// Figma's sample breakdown, as many segments as the variant draws.
const _sample = [
  SolarBarStackSegment(value: 24, color: SolarBarColor.feedbackDangerStrong),
  SolarBarStackSegment(value: 32, color: SolarBarColor.feedbackWarningMedium),
  SolarBarStackSegment(value: 20, color: SolarBarColor.feedbackInfoMedium),
  SolarBarStackSegment(value: 48, color: SolarBarColor.feedbackNeutralSubtle),
];

/// SolarBarStack in one oracle variant, named as the web case is: each orientation and count, in
/// Figma's 32 × 80 (80 × 32 across), as it fills the box it is given.
Widget buildBarStack(
  Map<String, dynamic> v,
  WidgetStatesController _, [
  Map<String, dynamic>? _,
]) {
  final props = v['props'] as Map<String, dynamic>;
  final orientation = enumNamed(
    SolarBarStackOrientation.values,
    props['orientation'] as String,
  );
  final across = orientation == SolarBarStackOrientation.horizontal;
  final count = int.parse(
    RegExp(r'segments=(\d)').firstMatch(v['figma'] as String)?.group(1) ?? '2',
  );
  return SizedBox(
    width: across ? 80 : 32,
    height: across ? 32 : 80,
    child: SolarBarStack(
      orientation: orientation,
      segments: _sample.sublist(4 - count),
    ),
  );
}
