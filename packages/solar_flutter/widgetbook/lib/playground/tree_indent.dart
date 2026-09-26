// Tree Indent's Playground: its depth, a row of that many units of indent. As the web's
// (stories/playground/tree-indent.tsx).

import 'package:solar_flutter/solar_flutter.dart';

import 'playground.dart';

final treeIndentPlayground = SolarPlaygroundBuilder(
  build: (p) =>
      SolarTreeIndent(depth: p.choice('depth', SolarTreeIndentDepth.values)),
);
