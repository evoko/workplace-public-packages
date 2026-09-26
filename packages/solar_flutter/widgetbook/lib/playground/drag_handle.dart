// DragHandle's Playground: its size and disabled from their controls. It does nothing itself (the
// drag is its list's), so it has no callback to log; hovering, focusing and holding it draw its
// states. As the web's (stories/playground/drag-handle.tsx).

import 'package:solar_flutter/solar_flutter.dart';

import 'playground.dart';

final dragHandlePlayground = SolarPlaygroundBuilder(
  build: (p) => SolarDragHandle(
    size: p.choice('size', SolarDragHandleSize.values),
    disabled: p.flag('disabled'),
  ),
);
