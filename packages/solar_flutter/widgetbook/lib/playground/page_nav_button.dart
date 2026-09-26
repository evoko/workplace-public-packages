// PageNavButton's Playground: its direction from its control; disabled, it has no callback; its tap
// is logged. As the web's (stories/playground/page-nav-button.tsx).

import 'package:solar_flutter/solar_flutter.dart';

import 'playground.dart';

final pageNavButtonPlayground = SolarPlaygroundBuilder(
  build: (p) => SolarPageNavButton(
    direction: p.choice('direction', SolarPageNavButtonDirection.values),
    onPressed: p.flag('disabled') ? null : () => p.log('onPressed'),
  ),
);
