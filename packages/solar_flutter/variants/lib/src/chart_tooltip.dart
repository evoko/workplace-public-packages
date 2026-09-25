import 'package:flutter/material.dart';
import 'package:solar_flutter/solar_flutter.dart';

/// SolarChartTooltip in one oracle variant, named as the web case is: Figma's title and value, one
/// bare value (single) or three named series (multi), in Figma's sample colours, the first of which
/// the check measures (its StatusIndicator's success).
Widget buildChartTooltip(
  Map<String, dynamic> v,
  WidgetStatesController _, [
  Map<String, dynamic>? _,
]) {
  final multi = (v['figma'] as String).contains('multi');
  return Builder(
    builder: (context) {
      final c = (Theme.of(context).extension<SolarTheme>() ?? SolarTheme.light)
          .colors;
      final colours = [
        c.surfaceFeedbackSuccessStrong,
        c.surfaceFeedbackWarningStrong,
        c.surfaceFeedbackDangerStrong,
      ];
      return SolarChartTooltip(
        title: 'Jan 2026',
        rows: multi
            ? [
                for (final (i, color) in colours.indexed)
                  SolarChartTooltipRow(
                    label: 'Series ${i + 1}',
                    value: '60.4k',
                    color: color,
                  ),
              ]
            : [SolarChartTooltipRow(value: '60.4k', color: colours.first)],
      );
    },
  );
}
