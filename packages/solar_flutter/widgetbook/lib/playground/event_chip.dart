// Event Chip's Playground: its category, variant, time and title from their controls, a cleared
// time left out; its `repeating` icon control stands for whether the event repeats, since the
// widget draws its own icon: `_none` makes it a one-off. It fills the width box, as a chip fills its
// cell. A styled part: what a tap does is the app's, and it takes none. As the web's
// (stories/playground/event-chip.tsx).

import 'package:solar_flutter/solar_flutter.dart';

import 'playground.dart';

final eventChipPlayground = SolarPlaygroundBuilder(
  build: (p) => SolarEventChip(
    category: p.choice('category', SolarEventChipCategory.values),
    variant: p.choice('variant', SolarEventChipVariant.values),
    time: p.words('time'),
    repeating: p.icon('repeating') != null,
    title: p.text('title'),
  ),
);
