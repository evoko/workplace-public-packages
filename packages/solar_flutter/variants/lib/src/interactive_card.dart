import 'package:flutter/material.dart';
import 'package:solar_flutter/solar_flutter.dart';

import 'probes.dart';

/// SolarInteractiveCard in one oracle variant, named as the web case is: Figma's words, an icon
/// probe, its drag handle, three Icon Buttons as its actions, and the control the variant chooses, pressable so its states are forced through
/// [states]; as wide as Figma draws it.
Widget buildInteractiveCard(
  Map<String, dynamic> v,
  WidgetStatesController states, [
  Map<String, dynamic>? _,
]) {
  final props = v['props'] as Map<String, dynamic>;
  return SizedBox(
    width: 423,
    child: SolarInteractiveCard(
      selected: props['selected'] as bool,
      dragging: props['dragging'] as bool,
      control: enumNamed(
        SolarInteractiveCardControl.values,
        props['control'] as String,
      ),
      title: 'Headline',
      description: 'Description',
      icon: const IconProbe(),
      // The caller's Icon Buttons, each keyed as the layer Figma draws it in, so each is measured
      // as the Icon Button check measures one.
      actions: [
        for (final layer in ['iconButton', 'iconButton2', 'iconButton3'])
          KeyedSubtree(
            key: ValueKey('interactiveCard.$layer'),
            child: SolarIconButton(
              onPressed: () {},
              icon: const IconProbe(key: Key('icon')),
              semanticLabel: 'Action',
              variant: SolarIconButtonVariant.secondary,
            ),
          ),
      ],
      dragHandle: true,
      onSelectedChanged: (_) {},
      onPressed: () {},
      statesController: states,
    ),
  );
}
