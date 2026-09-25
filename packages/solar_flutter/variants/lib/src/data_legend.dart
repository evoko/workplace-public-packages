import 'package:flutter/material.dart';
import 'package:solar_flutter/solar_flutter.dart';

import 'probes.dart';

/// SolarDataLegend in one oracle variant, named as the web case is: each direction with as many
/// series as Figma draws (the variant's items), each named, in Figma's sample colours, the first of
/// which the check measures (its StatusIndicator's success).
Widget buildDataLegend(
  Map<String, dynamic> v,
  WidgetStatesController _, [
  Map<String, dynamic>? _,
]) {
  final props = v['props'] as Map<String, dynamic>;
  final count = int.parse(
    RegExp(r'items=(\d)').firstMatch(v['figma'] as String)?.group(1) ?? '2',
  );
  return Builder(
    builder: (context) {
      final c = (Theme.of(context).extension<SolarTheme>() ?? SolarTheme.light)
          .colors;
      final colours = [
        c.surfaceFeedbackSuccessStrong,
        c.surfaceFeedbackWarningStrong,
        c.surfaceFeedbackDangerStrong,
        c.surfaceFeedbackInfoStrong,
      ];
      return SolarDataLegend(
        direction: enumNamed(
          SolarDataLegendDirection.values,
          props['direction'] as String,
        ),
        items: [
          for (var i = 0; i < count; i++)
            SolarDataLegendItem(label: 'Series ${i + 1}', color: colours[i]),
        ],
      );
    },
  );
}
