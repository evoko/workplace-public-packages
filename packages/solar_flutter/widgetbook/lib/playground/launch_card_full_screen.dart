// Launch Card Full Screen's Playground: its words from their controls, a cleared intro left out; the
// `features` extra's count of Figma's sample paragraphs; the sample picture (samples.dart); its
// app's icon, shown by `appIcon`, the sample picture (cards.dart); its favourite, shown by
// `favourite`, a SolarIconButton (md, round, tertiary); its action, shown by `action`, a
// SolarButton, "Open". Each tap is logged with its name. As the web's
// (stories/playground/launch-card-full-screen.tsx).

import 'package:flutter/widgets.dart';
import 'package:solar_flutter/solar_flutter.dart';

import 'cards.dart';
import 'playground.dart';
import 'samples.dart';

final launchCardFullScreenPlayground = SolarPlaygroundBuilder(
  build: (p) => SolarLaunchCardFullScreen(
    name: p.text('name'),
    intro: p.words('intro'),
    features: sampleFeatures.take(p.whole('features')).toList(),
    image: samplePicture,
    appIcon: p.child('appIcon').shown ? sampleAppIcon() : null,
    favourite: p.child('favourite').shown
        ? SolarIconButton(
            size: SolarIconButtonSize.md,
            shape: SolarIconButtonShape.round,
            prio: SolarIconButtonPrio.tertiary,
            icon: const SolarIcon(SolarIcons.starOutline),
            semanticLabel: 'Favourite',
            onPressed: () => p.log('onPressed', 'favourite'),
          )
        : null,
    action: p.child('action').shown
        ? SolarButton(
            onPressed: () => p.log('onPressed', 'Open'),
            child: const Text('Open'),
          )
        : null,
  ),
);
