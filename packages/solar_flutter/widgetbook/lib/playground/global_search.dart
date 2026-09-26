// GlobalSearch's Playground: a trigger drawn as a field, not a field, so nothing is typed in it: its
// words the `placeholder` extra (Figma's "Search Workplace"; cleared, the widget's "Search"), or the
// `query` extra where it holds any (the app's search holds a query, drawn filled); its key the
// `shortcut` extra (Figma's "⌘K"), none where cleared. A tap, which opens the app's search, is
// logged. As the web's (stories/playground/global-search.tsx).

import 'package:solar_flutter/solar_flutter.dart';

import 'playground.dart';

final globalSearchPlayground = SolarPlaygroundBuilder(
  build: (p) => SolarGlobalSearch(
    size: p.choice('size', SolarGlobalSearchSize.values),
    error: p.flag('error'),
    placeholder: p.words('placeholder') ?? 'Search',
    query: p.words('query'),
    shortcut: p.words('shortcut'),
    onPressed: () => p.log('onPressed'),
  ),
);
