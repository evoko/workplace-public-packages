// Chart Tooltip's Playground: the point's title from its control; the `rows` extra's number of
// series at the point, the first its `label` and `value` controls, the rest sample series and
// values (samples.dart), each in the SOLAR chart theme's colour for its place. One row with no label
// is the compact single tooltip, as the widget draws a bare value; named rows the multi one. As the
// web's (stories/playground/chart-tooltip.tsx).

import 'package:flutter/widgets.dart';
import 'package:solar_flutter/solar_flutter.dart';

import 'charts.dart';
import 'playground.dart';
import 'samples.dart';

final chartTooltipPlayground = SolarPlaygroundBuilder(
  build: (p) {
    final title = p.text('title');
    final label = p.words('label');
    final value = p.text('value');
    final rows = p.whole('rows');
    return Builder(
      builder: (context) => SolarChartTooltip(
        title: title,
        rows: [
          for (var i = 0; i < rows; i++)
            i == 0
                ? SolarChartTooltipRow(
                    label: label,
                    value: value,
                    color: seriesColor(context, 0),
                  )
                : SolarChartTooltipRow(
                    label: sampleSeries[i],
                    value: sampleSeriesValues[i],
                    color: seriesColor(context, i),
                  ),
        ],
      ),
    );
  },
);
