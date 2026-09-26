// What the chart Playground builders share: the numbers a comma-separated text holds (words that
// are no number ignored), and a series' colour, the SOLAR chart theme's (SolarChartTheme), so a
// sample series is coloured as a SOLAR chart colours it. As the web's
// (stories/playground/charts.ts).

import 'package:flutter/widgets.dart';
import 'package:solar_flutter/solar_flutter.dart';

List<double> numbersIn(String text) => [
  for (final word in text.split(','))
    if (double.tryParse(word.trim()) case final n? when n.isFinite) n,
];

/// The chart theme's colour for the series at [i].
Color seriesColor(BuildContext context, int i) {
  final series = SolarChartTheme(SolarTheme.of(context)).series;
  return series[i % series.length];
}
