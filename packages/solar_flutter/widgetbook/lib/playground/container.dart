// Container's Playground: its type from its control; its content a neutral placeholder, a
// SolarSkeleton, shown by the `content` toggle. As the web's (stories/playground/container.tsx).

import 'package:solar_flutter/solar_flutter.dart';

import 'playground.dart';

final containerPlayground = SolarPlaygroundBuilder(
  build: (p) => SolarContainer(
    type: p.choice('type', SolarContainerType.values),
    children: [if (p.flag('content')) const SolarSkeleton()],
  ),
);
