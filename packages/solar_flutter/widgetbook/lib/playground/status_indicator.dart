// StatusIndicator's Playground: its type and size. Decorative, as beside the words that say the
// status in an app. As the web's (stories/playground/status-indicator.tsx).

import 'package:solar_flutter/solar_flutter.dart';

import 'playground.dart';

final statusIndicatorPlayground = SolarPlaygroundBuilder(
  build: (p) => SolarStatusIndicator(
    type: p.choice('type', SolarStatusIndicatorType.values),
    size: p.choice('size', SolarStatusIndicatorSize.values),
  ),
);
