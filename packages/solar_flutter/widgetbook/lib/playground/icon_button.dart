// Icon Button's Playground: a toggle icon button, as a toolbar option is: a tap switches it on or
// off, which the `active` control follows. Its icon from its control (the sample, a plus, at
// first); named "Label", since an icon alone is no name. As the web's
// (stories/playground/icon-button.tsx).

import 'package:flutter/widgets.dart';
import 'package:solar_flutter/solar_flutter.dart';

import 'playground.dart';

final iconButtonPlayground = SolarPlaygroundBuilder(
  build: (p) {
    final active = p.flag('active');
    return SolarIconButton(
      size: p.choice('size', SolarIconButtonSize.values),
      shape: p.choice('shape', SolarIconButtonShape.values),
      prio: p.choice('prio', SolarIconButtonPrio.values),
      loading: p.flag('loading'),
      active: active,
      icon: p.icon('icon') ?? const SizedBox.shrink(),
      semanticLabel: 'Label',
      onPressed: p.flag('disabled')
          ? null
          : () {
              p.set('active', !active);
              p.log('onPressed');
            },
    );
  },
);
