// Link's Playground: its words the `label` extra, its icons from their controls (both the sample at
// first, as Figma shows both). A tap is logged; a disabled link is inert, by a null callback. As the
// web's (stories/playground/link.tsx).

import 'package:solar_flutter/solar_flutter.dart';

import 'playground.dart';

final linkPlayground = SolarPlaygroundBuilder(
  build: (p) => SolarLink(
    size: p.choice('size', SolarLinkSize.values),
    label: p.text('label'),
    leadingIcon: p.icon('leadingIcon'),
    trailingIcon: p.icon('trailingIcon'),
    onPressed: p.flag('disabled') ? null : () => p.log('onPressed'),
  ),
);
