// Data Legend's Playground: its direction from its control; the `items` extra's number of sample
// series (samples.dart), the first named by the `label` control (cleared, its sample name), each in
// the SOLAR chart theme's colour for its place, as a SOLAR chart colours its series. As the web's
// (stories/playground/data-legend.tsx).

import 'package:flutter/widgets.dart';
import 'package:solar_flutter/solar_flutter.dart';

import 'charts.dart';
import 'playground.dart';
import 'samples.dart';

final dataLegendPlayground = SolarPlaygroundBuilder(
  build: (p) {
    final first = p.words('label');
    final direction = p.choice('direction', SolarDataLegendDirection.values);
    final items = p.whole('items');
    return Builder(
      builder: (context) => SolarDataLegend(
        direction: direction,
        items: [
          for (final (i, name) in sampleSeries.take(items).indexed)
            SolarDataLegendItem(
              label: i == 0 && first != null ? first : name,
              color: seriesColor(context, i),
            ),
        ],
      ),
    );
  },
);
