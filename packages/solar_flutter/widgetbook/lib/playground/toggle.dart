// Toggle's Playground: selected from its control, disabled by a null callback; a tap turns it on or
// off, which the `selected` control follows. Named "Setting". As the web's
// (stories/playground/toggle.tsx).

import 'package:solar_flutter/solar_flutter.dart';

import 'playground.dart';

final togglePlayground = SolarPlaygroundBuilder(
  build: (p) => SolarToggle(
    selected: p.flag('selected'),
    onChanged: p.flag('disabled')
        ? null
        : (selected) {
            p.set('selected', selected);
            p.log('onChanged', selected);
          },
    semanticLabel: 'Setting',
  ),
);
