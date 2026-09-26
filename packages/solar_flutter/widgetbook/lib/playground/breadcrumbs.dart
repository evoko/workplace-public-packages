// Breadcrumbs' Playground: a trail of the `items` extra's sample pages from the top, the last the
// current page; past five the middle collapses to an ellipsis, whose menu lists the pages it hides.
// Choosing a page goes to it, as an app's trail does: the trail ends at it (`items` is set), and the
// tap is logged with its words. As the web's (stories/playground/breadcrumbs.tsx).

import 'package:solar_flutter/solar_flutter.dart';

import 'playground.dart';
import 'samples.dart';

final breadcrumbsPlayground = SolarPlaygroundBuilder(
  build: (p) {
    final n = p.whole('items');
    return SolarBreadcrumbs(
      children: [
        for (var i = 0; i < n; i++)
          SolarBreadcrumbItem(
            label: samplePages[i],
            onPressed: () {
              p.set('items', i + 1);
              p.log('onPressed', samplePages[i]);
            },
          ),
      ],
    );
  },
);
