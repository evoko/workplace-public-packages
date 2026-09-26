// Checkbox's Playground: checked, mixed and disabled from their controls; a tap checks it or clears
// it, which the `checked` control follows, and ends a mixed state. Named "Option". As the web's
// (stories/playground/checkbox.tsx).

import 'package:solar_flutter/solar_flutter.dart';

import 'playground.dart';

final checkboxPlayground = SolarPlaygroundBuilder(
  build: (p) => SolarCheckbox(
    checked: p.flag('checked'),
    mixed: p.flag('mixed'),
    onChanged: p.flag('disabled')
        ? null
        : (checked) {
            p.set('checked', checked);
            p.set('mixed', false);
            p.log('onChanged', checked);
          },
    semanticLabel: 'Option',
  ),
);
