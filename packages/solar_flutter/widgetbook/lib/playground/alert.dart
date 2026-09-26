// Alert's Playground: its type, variant (Figma's `style`), title, description and action from their
// controls, each cleared part left out; the action's tap is logged. It fills its container, the
// width box. As the web's (stories/playground/alert.tsx).

import 'package:solar_flutter/solar_flutter.dart';

import 'playground.dart';

final alertPlayground = SolarPlaygroundBuilder(
  build: (p) => SolarAlert(
    type: p.choice('type', SolarAlertType.values),
    variant: p.choice('variant', SolarAlertVariant.values),
    title: p.words('title'),
    description: p.words('description'),
    action: p.words('action'),
    onAction: () => p.log('onAction'),
  ),
);
