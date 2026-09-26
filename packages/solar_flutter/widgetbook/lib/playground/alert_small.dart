// Alert Small's Playground: as Alert's, the compact callout; its type, variant (Figma's `style`),
// title, description and action from their controls, each cleared part left out, the action's tap
// logged. It fills its container, the width box. As the web's (stories/playground/alert-small.tsx).

import 'package:solar_flutter/solar_flutter.dart';

import 'playground.dart';

final alertSmallPlayground = SolarPlaygroundBuilder(
  build: (p) => SolarAlertSmall(
    type: p.choice('type', SolarAlertSmallType.values),
    variant: p.choice('variant', SolarAlertSmallVariant.values),
    title: p.words('title'),
    description: p.words('description'),
    action: p.words('action'),
    onAction: () => p.log('onAction'),
  ),
);
