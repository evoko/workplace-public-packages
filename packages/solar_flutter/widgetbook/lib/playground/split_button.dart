// SplitButton's Playground: the action's label from its control; the chevron opens the widget's own
// menu of three sample variants, and choosing one closes it. The action, the menu opening and the
// variant chosen are each logged. As the web's (stories/playground/split-button.tsx).

import 'package:solar_flutter/solar_flutter.dart';

import 'playground.dart';

/// The action's sample variants.
const _variants = ['Option 1', 'Option 2', 'Option 3'];

final splitButtonPlayground = SolarPlaygroundBuilder(
  build: (p) => SolarSplitButton(
    prio: p.choice('prio', SolarSplitButtonPrio.values),
    size: p.choice('size', SolarSplitButtonSize.values),
    loading: p.flag('loading'),
    label: p.text('label'),
    onPressed: p.flag('disabled') ? null : () => p.log('onPressed'),
    onMenuPressed: () => p.log('onMenuPressed'),
    items: [
      for (final label in _variants)
        SolarSplitButtonItem(
          label: label,
          onSelected: () => p.log('onSelected', label),
        ),
    ],
  ),
);
