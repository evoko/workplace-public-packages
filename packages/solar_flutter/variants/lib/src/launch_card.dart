import 'package:flutter/material.dart';
import 'package:solar_flutter/solar_flutter.dart';

import 'probes.dart';

/// SolarLaunchCard in one oracle variant, named as the web case is: Figma's words, a stand-in
/// picture where the variant has one, a stand-in App Icon, a Tag, its favourite, and the Button Group Figma draws, its Buttons keyed
/// as the Button Group check keys them; pressable so its focus is forced through [states]; as wide
/// as Figma draws it.
Widget buildLaunchCard(
  Map<String, dynamic> v,
  WidgetStatesController states, [
  Map<String, dynamic>? _,
]) {
  // The group's Buttons, as Figma draws them here: words alone, their icons and counter hidden.
  Widget button(String layer, SolarButtonPrio prio) => KeyedSubtree(
    key: Key(layer),
    child: SolarButton(
      onPressed: () {},
      prio: prio,
      child: const Text('Label'),
    ),
  );
  return SizedBox(
    width: 340,
    child: SolarLaunchCard(
      name: 'Workplace',
      body: 'Book rooms and desks, and find your colleagues.',
      appIcon: const IconProbe(),
      tag: 'New',
      image: ((v['content'] as List?) ?? const []).contains('image')
          ? pictureProbe
          : null,
      favourite: SolarIconButton(
        onPressed: () {},
        icon: const IconProbe(key: Key('icon')),
        semanticLabel: 'Favourite',
        shape: SolarIconButtonShape.round,
        prio: SolarIconButtonPrio.tertiary,
      ),
      actions: SolarButtonGroup(
        orientation: SolarButtonGroupOrientation.horizontal,
        // The tertiary, which Figma hides here, is not drawn.
        children: [
          button('secondaryCTA', SolarButtonPrio.secondary),
          button('button3', SolarButtonPrio.primary),
        ],
      ),
      onPressed: () {},
      statesController: states,
    ),
  );
}
