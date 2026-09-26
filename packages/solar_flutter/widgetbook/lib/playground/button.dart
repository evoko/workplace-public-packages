// Button's Playground: its label as its words (cleared, an icon-only button named "Label"), its
// icons, and its counter, a SolarCounter showing the `counter count` extra, which takes the type the
// Button's recipe composes from the Button itself. As the web's (stories/playground/button.tsx).

import 'package:flutter/widgets.dart';
import 'package:solar_flutter/solar_flutter.dart';

import 'playground.dart';

final buttonPlayground = SolarPlaygroundBuilder(
  build: (p) {
    final props = SolarButtonProps(
      size: p.choice('size', SolarButtonSize.values),
      prio: p.choice('prio', SolarButtonPrio.values),
      disabled: p.flag('disabled'),
      loading: p.flag('loading'),
      danger: p.flag('danger'),
    );
    final label = p.words('label');
    final counter = p.child('counter');
    final count = p.whole('counter count');
    return SolarButton(
      size: props.size,
      prio: props.prio,
      loading: props.loading,
      danger: props.danger,
      iconLeading: p.icon('iconLeading'),
      iconTrailing: p.icon('iconTrailing'),
      counter: counter.shown ? SolarCounter(count: count) : null,
      semanticLabel: label == null ? 'Label' : null,
      onPressed: props.disabled ? null : () => p.log('onPressed'),
      child: label == null ? null : Text(label),
    );
  },
);
