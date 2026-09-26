// Option Row's Playground: its control from `control`, on while the `checked` extra holds, which a
// tap on the row sets, and disabled while `disabled` does; its words the `label` extra, its second
// line from `supportingText`, a cleared one left out. A radio works only in its group, so a radio
// row is drawn in a RadioGroup of its own, checked where the group holds it; a tap checks it, and
// nothing unchecks it but the control, as a radio. As the web's
// (stories/playground/option-row.tsx).

import 'package:flutter/widgets.dart';
import 'package:solar_flutter/solar_flutter.dart';

import 'playground.dart';

/// The row's value in its group, a radio's.
const _value = 'option';

final optionRowPlayground = SolarPlaygroundBuilder(
  build: (p) {
    final control = p.choice('control', SolarOptionRowControl.values);
    final checked = p.flag('checked');
    final row = SolarOptionRow<String>(
      control: control,
      value: _value,
      label: p.text('label'),
      supportingText: p.words('supportingText'),
      checked: checked,
      disabled: p.flag('disabled'),
      onChanged: (on) {
        p.set('checked', on);
        p.log('onChanged', on);
      },
    );
    return control == SolarOptionRowControl.radio
        ? RadioGroup<String>(
            groupValue: checked ? _value : null,
            onChanged: (_) {
              p.set('checked', true);
              p.log('onChanged', true);
            },
            child: row,
          )
        : row;
  },
);
