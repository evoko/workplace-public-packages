// PaginationNav's Playground: its direction from its control; disabled, it has no callback; its tap
// is logged. As the web's (stories/playground/pagination-nav.tsx).

import 'package:solar_flutter/solar_flutter.dart';

import 'playground.dart';

final paginationNavPlayground = SolarPlaygroundBuilder(
  build: (p) => SolarPaginationNav(
    direction: p.choice('direction', SolarPaginationNavDirection.values),
    onPressed: p.flag('disabled') ? null : () => p.log('onPressed'),
  ),
);
