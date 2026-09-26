// Bar's Playground: its colour from its control. A bar fills the box its chart gives it, so it is
// drawn in a box of the `thickness` and `length` extras (a column, as Figma draws it, at Figma's
// 32 × 80 at first): the chart's data, not the bar's design. As the web's
// (stories/playground/bar.tsx).

import 'package:flutter/widgets.dart';
import 'package:solar_flutter/solar_flutter.dart';

import 'playground.dart';

final barPlayground = SolarPlaygroundBuilder(
  build: (p) => SizedBox(
    width: p.whole('thickness').toDouble(),
    height: p.whole('length').toDouble(),
    child: SolarBar(color: p.choice('color', SolarBarColor.values)),
  ),
);
