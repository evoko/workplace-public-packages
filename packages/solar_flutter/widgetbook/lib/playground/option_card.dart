// Option Card's Playground: its words and state from their controls. Pressing it makes it the
// current one of its set, as an app's grid of tiles does: `selected` is set, and the press logged.
// As the web's (stories/playground/option-card.tsx).

import 'package:solar_flutter/solar_flutter.dart';

import 'playground.dart';

final optionCardPlayground = SolarPlaygroundBuilder(
  build: (p) => SolarOptionCard(
    selected: p.flag('selected'),
    label: p.text('label'),
    onPressed: () {
      p.set('selected', true);
      p.log('onPressed');
    },
  ),
);
