// Radio's Playground: a radio alone is a bug, SOLAR says, so it is drawn as an app draws it, one of
// a RadioGroup of three, each labelled. The group decides which is checked: the `selected` extra
// names it, and the IR's `checked` says whether the group holds a choice at all (off: none is
// checked). Tapping a radio chooses it, which both follow. `disabled` disables every radio, so a
// disabled radio shows checked and unchecked. As the web's (stories/playground/radio.tsx).

import 'package:flutter/widgets.dart';
import 'package:solar_flutter/solar_flutter.dart';

import 'playground.dart';

/// The sample choices, as the `selected` extra's dartOptions name them.
enum _Option { option1, option2, option3 }

/// A choice's words, the `selected` extra's option at its index.
String _words(_Option o) => 'Option ${o.index + 1}';

final radioPlayground = SolarPlaygroundBuilder(
  build: (p) {
    final disabled = p.flag('disabled');
    final checked = p.flag('checked');
    final selected = p.choice('selected', _Option.values);
    return RadioGroup<_Option>(
      groupValue: checked ? selected : null,
      onChanged: (value) {
        if (value == null) return;
        p.setChoice('selected', value);
        p.set('checked', true);
        p.log('onChanged', _words(value));
      },
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          for (final option in _Option.values)
            Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                SolarRadio<_Option>(
                  value: option,
                  disabled: disabled,
                  semanticLabel: _words(option),
                ),
                ExcludeSemantics(child: Text(_words(option))),
              ],
            ),
        ],
      ),
    );
  },
);
