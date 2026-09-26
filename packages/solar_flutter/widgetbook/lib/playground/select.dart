// Select's Playground: three sample options (samples.dart), the chosen one the `value` extra
// (`none`: Figma's placeholder shows), which choosing sets. The IR's `open` is the panel's: the
// widget opens its panel as it is first built where `open` holds, so the Select is built afresh
// when `open` changes, which opens or closes it; the widget tells no one when its panel opens or
// closes, so a tap's opening does not reach `open`. Its label, helper, size and states from their
// controls, a cleared label or helper left out, mandatory while `mandatory` holds any text. The
// chevron is the widget's own, drawn whatever `trailingIcon` picks (the widget takes no icon). As
// the web's (stories/playground/select.tsx).

import 'package:flutter/widgets.dart';
import 'package:solar_flutter/solar_flutter.dart';

import 'playground.dart';
import 'samples.dart';

final selectPlayground = SolarPlaygroundBuilder(
  build: (p) {
    final value = p.choice('value', SampleOption.values);
    final open = p.flag('open');
    // Read, though the widget draws its own chevron whatever is picked.
    p.icon('trailingIcon');
    return SolarSelect<SampleOption>(
      // Built afresh where `open` changes: the widget reads it only as it is first built.
      key: ValueKey(open),
      size: p.choice('size', SolarSelectSize.values),
      open: open,
      enabled: !p.flag('disabled'),
      error: p.flag('error'),
      label: p.words('label'),
      mandatory: p.words('mandatory') != null,
      helper: p.words('helper'),
      placeholder: 'Placeholder',
      value: value == SampleOption.none ? null : value,
      options: [
        for (final o in sampleOptions)
          SolarSelectOption(value: o, label: sampleOptionWords(o)),
      ],
      onChanged: (o) {
        p.setChoice('value', o);
        p.log('onChanged', sampleOptionWords(o));
      },
    );
  },
);
