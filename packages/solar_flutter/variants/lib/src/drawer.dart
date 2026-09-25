import 'package:flutter/material.dart';
import 'package:solar_flutter/solar_flutter.dart';

/// SolarDrawer in its one oracle variant, named as the web case is: its title, a line of words as
/// its content (Figma's are a sample) and its full-width footer, its Buttons keyed as the Button
/// Group check keys them; closable, so its close button is drawn; the height of a short screen.
Widget buildDrawer(
  Map<String, dynamic> v,
  WidgetStatesController _, [
  Map<String, dynamic>? _,
]) {
  Widget button(String layer, SolarButtonPrio prio) => KeyedSubtree(
    key: Key(layer),
    child: SolarButton(
      onPressed: () {},
      size: SolarButtonSize.lg,
      prio: prio,
      child: const Text('Label'),
    ),
  );
  return SizedBox(
    height: 560,
    child: SolarDrawer(
      title: 'Drawer Title',
      content: const Text('Drawer content goes here.'),
      actions: SolarButtonGroup(
        type: SolarButtonGroupType.fullWidth,
        children: [
          button('tertiaryCTA', SolarButtonPrio.secondary),
          button('secondaryCTA', SolarButtonPrio.primary),
        ],
      ),
      onClose: () {},
    ),
  );
}
