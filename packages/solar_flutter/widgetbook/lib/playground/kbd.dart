// Kbd's Playground: its type, and its key's label from the `label` extra (Figma's ⌘K at first). As
// the web's (stories/playground/kbd.tsx).

import 'package:solar_flutter/solar_flutter.dart';

import 'playground.dart';

final kbdPlayground = SolarPlaygroundBuilder(
  build: (p) => SolarKbd(
    type: p.choice('type', SolarKbdType.values),
    label: p.text('label'),
  ),
);
