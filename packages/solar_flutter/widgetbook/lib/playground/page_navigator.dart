// PageNavigator's Playground: where the reader is is the `pageIndicator` words, which it shows: their
// first two whole numbers are the page and the count ("1 of 10", or "Step 1/10"), and words with
// fewer are one page. Going back or on writes the new page into the words, in the tester's wording,
// and is logged; a page past the count is written back as the last. As the web's
// (stories/playground/page-navigator.tsx).

import 'dart:math' as math;

import 'package:flutter/widgets.dart';
import 'package:solar_flutter/solar_flutter.dart';

import 'playground.dart';

final _number = RegExp(r'\d+');

final pageNavigatorPlayground = SolarPlaygroundBuilder(
  build: (p) {
    final words = p.text('pageIndicator');
    final numbers = _number.allMatches(words).map((m) => m[0]!).toList();
    final counted = numbers.length >= 2;
    final count = counted ? math.max(1, int.parse(numbers[1])) : 1;
    final wanted = counted ? int.parse(numbers[0]) : 1;
    final page = wanted.clamp(1, count);
    // The words at page [n]: their first number replaced.
    String at(int n) => words.replaceFirst(_number, '$n');
    if (counted && page != wanted) {
      // Not while building: the write rebuilds the Playground.
      WidgetsBinding.instance.addPostFrameCallback(
        (_) => p.set('pageIndicator', at(page)),
      );
    }
    return SolarPageNavigator(
      count: count,
      page: page,
      indicator: (_, _) => words,
      onChanged: (n) {
        p.set('pageIndicator', at(n));
        p.log('onChanged', n);
      },
    );
  },
);
