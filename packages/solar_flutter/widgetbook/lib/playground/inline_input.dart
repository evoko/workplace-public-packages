// Inline Input's Playground: its value the IR's `value` control, which a confirmed edit sets; its
// states from their controls. It holds its own mode and draft, as the widget does: a tap or its
// edit button opens it (the widget gives no callback for that, so nothing is logged), Enter or
// Confirm commits the draft (logged, and set), Esc or Cancel discards it (logged). Every value is
// accepted. It is named "Value" (the input, and the edit button's "Edit Value"). As the web's
// (stories/playground/inline-input.tsx).

import 'package:solar_flutter/solar_flutter.dart';

import 'playground.dart';

final inlineInputPlayground = SolarPlaygroundBuilder(
  build: (p) => SolarInlineInput(
    error: p.flag('error'),
    enabled: !p.flag('disabled'),
    value: p.text('value'),
    label: 'Value',
    onConfirm: (value) {
      p.set('value', value);
      p.log('onConfirm', value);
      return null;
    },
    onCancel: () => p.log('onCancel'),
  ),
);
