import 'package:flutter/material.dart';
import 'package:solar_flutter/solar_flutter.dart';

import 'probes.dart';

/// SolarLaunchCardFullScreen, named as the web case is: Figma's words, a stand-in picture and App
/// Icon, its favourite and its Button; as wide as Figma draws it. It has no variants and no
/// states.
Widget buildLaunchCardFullScreen(
  Map<String, dynamic> _,
  WidgetStatesController _, [
  Map<String, dynamic>? _,
]) => SizedBox(
  width: 979,
  child: SolarLaunchCardFullScreen(
    name: 'Workplace',
    intro: 'Book rooms and desks, and find your colleagues.',
    features: const [
      'Feature example 01',
      'Feature example 02',
      'Feature example 03',
    ],
    image: pictureProbe,
    appIcon: const IconProbe(),
    favourite: SolarIconButton(
      onPressed: () {},
      icon: const IconProbe(key: Key('icon')),
      semanticLabel: 'Favourite',
      size: SolarIconButtonSize.md,
      shape: SolarIconButtonShape.round,
      prio: SolarIconButtonPrio.tertiary,
    ),
    action: SolarButton(onPressed: () {}, child: const Text('Open')),
  ),
);
