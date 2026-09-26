// RowExpand's Playground: its type (a collapsed or expanded parent row's chevron, or a child row's
// connector), and whether a collapsed or expanded cell draws its chevron (the `chevron` extra).
// Decorative on its own: a Row draws it as its expand button, so it is drawn here as it is, the
// expansion the `type` control's. As the web's (stories/playground/row-expand.tsx).

import 'package:solar_flutter/solar_flutter.dart';

import 'playground.dart';

final rowExpandPlayground = SolarPlaygroundBuilder(
  build: (p) => SolarRowExpand(
    type: p.choice('type', SolarRowExpandType.values),
    chevron: p.flag('chevron'),
  ),
);
