// Node End's Playground: the dot, with or without its halo. As the web's
// (stories/playground/node-end.tsx).

import 'package:solar_flutter/solar_flutter.dart';

import 'playground.dart';

final nodeEndPlayground = SolarPlaygroundBuilder(
  build: (p) => SolarNodeEnd(halo: p.flag('halo')),
);
