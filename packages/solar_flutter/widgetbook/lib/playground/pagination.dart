// Pagination's Playground: the `count` pages and the current `page` extras, which choosing a page
// or an arrow sets. The page is kept within the pages shown: where `count` drops below it, the
// builder writes the last page back, so the panel shows the page the component does. As the web's
// (stories/playground/pagination.tsx).

import 'dart:math' as math;

import 'package:flutter/widgets.dart';
import 'package:solar_flutter/solar_flutter.dart';

import 'playground.dart';

final paginationPlayground = SolarPlaygroundBuilder(
  build: (p) {
    final count = p.whole('count');
    final wanted = p.whole('page');
    final page = math.min(wanted, count);
    if (page != wanted) {
      // Not while building: the write rebuilds the Playground.
      WidgetsBinding.instance.addPostFrameCallback((_) => p.set('page', page));
    }
    return SolarPagination(
      count: count,
      page: page,
      onChanged: (n) {
        p.set('page', n);
        p.log('onChanged', n);
      },
    );
  },
);
