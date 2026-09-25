import 'package:flutter/material.dart';
import 'package:solar_flutter/solar_flutter.dart';

import 'probes.dart';

/// SolarCoachmark in one oracle variant, named as the web case is: each side with Figma's words,
/// closable, so its close button is drawn; its actions the regular Button Group Figma composes, its
/// tertiary hidden, its Buttons keyed as the Button Group check keys them.
Widget buildCoachmark(
  Map<String, dynamic> v,
  WidgetStatesController _, [
  Map<String, dynamic>? _,
]) {
  final props = v['props'] as Map<String, dynamic>;
  Widget button(String layer, SolarButtonPrio prio) => KeyedSubtree(
    key: Key(layer),
    child: SolarButton(
      onPressed: () {},
      size: SolarButtonSize.md,
      prio: prio,
      child: const Text('Label'),
    ),
  );
  return SolarCoachmark(
    side: enumNamed(SolarCoachmarkSide.values, props['side'] as String),
    title: 'Title',
    body: 'Tutorial step text',
    counter: '1 / 6 steps',
    onClose: () {},
    actions: SolarButtonGroup(
      children: [
        button('secondaryCTA', SolarButtonPrio.secondary),
        button('button3', SolarButtonPrio.primary),
      ],
    ),
  );
}
