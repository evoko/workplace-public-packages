// Section Nav Group Header's Playground: its words from their control; not interactive. As the
// web's (stories/playground/section-nav-group-header.tsx).

import 'package:solar_flutter/solar_flutter.dart';

import 'playground.dart';

final sectionNavGroupHeaderPlayground = SolarPlaygroundBuilder(
  build: (p) => SolarSectionNavGroupHeader(label: p.text('label')),
);
