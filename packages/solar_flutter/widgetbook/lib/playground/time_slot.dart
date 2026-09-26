// Time Slot's Playground: a cell of a week or day grid, named by a sample hour; its state and
// density from their controls. A tap chooses it, as an app's grid chooses the cell it creates an
// event in: it is logged, and sets `selected`. As the web's (stories/playground/time-slot.tsx).

import 'package:solar_flutter/solar_flutter.dart';

import 'playground.dart';

final timeSlotPlayground = SolarPlaygroundBuilder(
  build: (p) => SolarTimeSlot(
    semanticLabel: 'Monday 9 AM',
    selected: p.flag('selected'),
    density: p.choice('density', SolarTimeSlotDensity.values),
    onPressed: () {
      p.set('selected', true);
      p.log('onPressed');
    },
  ),
);
