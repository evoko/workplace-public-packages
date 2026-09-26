// Spinner's Playground: its size and variant, named "Loading". As the web's
// (stories/playground/spinner.tsx).

import 'package:solar_flutter/solar_flutter.dart';

import 'playground.dart';

final spinnerPlayground = SolarPlaygroundBuilder(
  build: (p) => SolarSpinner(
    size: p.choice('size', SolarSpinnerSize.values),
    variant: p.choice('variant', SolarSpinnerVariant.values),
    semanticsLabel: 'Loading',
  ),
);
