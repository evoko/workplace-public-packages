// Slider Range's Playground: disabled from its control; its two ends the `low` and `high` extras in
// percent (the widget takes 0 to 1), which dragging a handle or an arrow key sets, in whole percent
// as the web's steps, a move within one percent setting and logging nothing; a drag's start and end
// are logged too. Where the panel puts `low` above `high`, the range is drawn from the lower to the
// higher. Its handles are named "Minimum" and "Maximum". It fills its container, the width box. As
// the web's (stories/playground/slider-range.tsx).

import 'dart:math' as math;

import 'package:flutter/material.dart' show RangeValues;
import 'package:solar_flutter/solar_flutter.dart';

import 'playground.dart';

final sliderRangePlayground = SolarPlaygroundBuilder(
  build: (p) {
    final disabled = p.flag('disabled');
    final low = math.min(p.whole('low'), p.whole('high'));
    final high = math.max(p.whole('low'), p.whole('high'));
    int percent(double v) => (v * 100).round();
    List<int> ends(RangeValues v) => [percent(v.start), percent(v.end)];
    return SolarSliderRange(
      values: RangeValues(low / 100, high / 100),
      disabled: disabled,
      onChanged: disabled
          ? null
          : (v) {
              final [from, to] = ends(v);
              if (from == low && to == high) return;
              p.set('low', from);
              p.set('high', to);
              p.log('onChanged', [from, to]);
            },
      onChangeStart: (v) => p.log('onChangeStart', ends(v)),
      onChangeEnd: (v) => p.log('onChangeEnd', ends(v)),
      semanticLabels: const ('Minimum', 'Maximum'),
    );
  },
);
