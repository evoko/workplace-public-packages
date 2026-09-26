// FAB's Playground: its label makes it an extended FAB; cleared, it is an icon FAB, named "Label".
// Its icon from its control (the sample, a plus, at first). As the web's (stories/playground/fab.tsx).

import 'package:flutter/widgets.dart';
import 'package:solar_flutter/solar_flutter.dart';

import 'playground.dart';

final fabPlayground = SolarPlaygroundBuilder(
  build: (p) {
    final label = p.words('label');
    return SolarFAB(
      size: p.choice('size', SolarFABSize.values),
      loading: p.flag('loading'),
      icon: p.icon('icon') ?? const SizedBox.shrink(),
      semanticLabel: label == null ? 'Label' : null,
      onPressed: p.flag('disabled') ? null : () => p.log('onPressed'),
      child: label == null ? null : Text(label),
    );
  },
);
