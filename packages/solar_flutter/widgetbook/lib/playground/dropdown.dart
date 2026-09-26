// Dropdown's Playground: three sample options (samples.dart), the chosen one the `value` extra
// (`none`: Figma's "Text" shows), which choosing sets. The IR's `open` is the panel's, as Select's:
// the Dropdown is built afresh when it changes, which opens or closes the panel; a tap's opening
// does not reach it (the widget tells no one). Its label is shown by the `label` toggle, in the
// `label text` extra's words; its helper, icons, size and states from their controls, a cleared
// helper left out, mandatory while `mandatory` holds any text. As the web's
// (stories/playground/dropdown.tsx).

import 'package:flutter/widgets.dart';
import 'package:solar_flutter/solar_flutter.dart';

import 'playground.dart';
import 'samples.dart';

final dropdownPlayground = SolarPlaygroundBuilder(
  build: (p) {
    final value = p.choice('value', SampleOption.values);
    final open = p.flag('open');
    final label = p.flag('label') ? p.text('label text') : '';
    return SolarDropdown<SampleOption>(
      // Built afresh where `open` changes: the widget reads it only as it is first built.
      key: ValueKey(open),
      size: p.choice('size', SolarDropdownSize.values),
      open: open,
      enabled: !p.flag('disabled'),
      error: p.flag('error'),
      label: label.isEmpty ? null : label,
      mandatory: p.words('mandatory') != null,
      helper: p.words('helper'),
      leadingIcon: p.icon('leadingIcon'),
      trailingIcon: p.icon('trailingIcon'),
      placeholder: 'Text',
      value: value == SampleOption.none ? null : value,
      options: [
        for (final o in sampleOptions)
          SolarDropdownOption(value: o, label: sampleOptionWords(o)),
      ],
      onChanged: (o) {
        p.setChoice('value', o);
        p.log('onChanged', sampleOptionWords(o));
      },
    );
  },
);
