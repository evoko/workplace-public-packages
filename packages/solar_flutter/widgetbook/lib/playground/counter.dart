// Counter's Playground: the `count` extra (at 0 it draws nothing, as SOLAR says; above 99 it reads
// `99+`), its type and disabled state. Given its tap callback, which is logged, it is a control of
// its own, so it shows its own states; disabled, the callback is null. As the web's
// (stories/playground/counter.tsx).

import 'package:solar_flutter/solar_flutter.dart';

import 'playground.dart';

final counterPlayground = SolarPlaygroundBuilder(
  build: (p) {
    final disabled = p.flag('disabled');
    return SolarCounter(
      type: p.choice('type', SolarCounterType.values),
      disabled: disabled,
      count: p.whole('count'),
      onPressed: disabled ? null : () => p.log('onPressed'),
    );
  },
);
