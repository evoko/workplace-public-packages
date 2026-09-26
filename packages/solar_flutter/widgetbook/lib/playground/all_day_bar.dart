// All-Day Bar's Playground: its variant, span, category, time and title from their controls, a
// cleared time left out. It fills the width box, as a bar fills the columns it spans. A styled
// part: what a tap does is the app's, and it takes none. As the web's
// (stories/playground/all-day-bar.tsx).

import 'package:solar_flutter/solar_flutter.dart';

import 'playground.dart';

final allDayBarPlayground = SolarPlaygroundBuilder(
  build: (p) => SolarAllDayBar(
    variant: p.choice('variant', SolarAllDayBarVariant.values),
    span: p.choice('span', SolarAllDayBarSpan.values),
    category: p.choice('category', SolarAllDayBarCategory.values),
    time: p.words('time'),
    title: p.text('title'),
  ),
);
