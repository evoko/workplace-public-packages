// Trend Badge's Playground: its type and size. Decorative, as beside the words that say the change
// in an app. As the web's (stories/playground/trend-badge.tsx).

import 'package:solar_flutter/solar_flutter.dart';

import 'playground.dart';

final trendBadgePlayground = SolarPlaygroundBuilder(
  build: (p) => SolarTrendBadge(
    type: p.choice('type', SolarTrendBadgeType.values),
    size: p.choice('size', SolarTrendBadgeSize.values),
  ),
);
