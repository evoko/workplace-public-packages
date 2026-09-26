// Sparkline's Playground: its trend and size from their controls; its values the `data` extra, its
// numbers comma-separated, drawn first to last (words that are no number ignored; with none,
// Figma's sample line). The trend is the control's, which colours the line whatever the values do,
// since the widget takes it from the values only where none is given. Named "Trend". As the web's
// (stories/playground/sparkline.tsx).

import 'package:solar_flutter/solar_flutter.dart';

import 'charts.dart';
import 'playground.dart';

final sparklinePlayground = SolarPlaygroundBuilder(
  build: (p) {
    final data = numbersIn(p.text('data'));
    return SolarSparkline(
      trend: p.choice('trend', SolarSparklineTrend.values),
      size: p.choice('size', SolarSparklineSize.values),
      data: data.isEmpty ? null : data,
      semanticLabel: 'Trend',
    );
  },
);
