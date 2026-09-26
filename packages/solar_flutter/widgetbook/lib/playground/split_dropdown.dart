// Split Dropdown's Playground: each zone's content a neutral placeholder, a SolarSkeleton, shown by
// its toggle (`topContent`, `lowerContent`). Nothing in it is interactive: each zone is the
// caller's. As the web's (stories/playground/split-dropdown.tsx).

import 'package:solar_flutter/solar_flutter.dart';

import 'playground.dart';

final splitDropdownPlayground = SolarPlaygroundBuilder(
  build: (p) => SolarSplitDropdown(
    top: p.flag('topContent') ? const SolarSkeleton() : null,
    lower: p.flag('lowerContent') ? const SolarSkeleton() : null,
  ),
);
