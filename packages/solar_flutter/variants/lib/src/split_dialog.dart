import 'package:flutter/material.dart';
import 'package:solar_flutter/solar_flutter.dart';

import 'probes.dart';

/// SolarSplitDialog in one oracle variant, named as the web case is: each cta with its title and an
/// icon probe, words in each pane (Figma's are samples), and the Button Group Figma draws for it,
/// its Buttons keyed as the Button Group check keys them; closable, so its close button is drawn.
Widget buildSplitDialog(
  Map<String, dynamic> v,
  WidgetStatesController _, [
  Map<String, dynamic>? _,
]) {
  final props = v['props'] as Map<String, dynamic>;
  final cta = enumNamed(
    SolarSplitDialogCta.values,
    props['cta'] as String,
    (c) => c.figma,
  );
  final regular = cta == SolarSplitDialogCta.regular;
  Widget button(String layer, SolarButtonPrio prio) => KeyedSubtree(
    key: Key(layer),
    child: SolarButton(
      onPressed: () {},
      size: regular ? SolarButtonSize.md : SolarButtonSize.lg,
      prio: prio,
      child: const Text('Label'),
    ),
  );
  return SolarSplitDialog(
    cta: cta,
    title: 'Dialog Title',
    icon: const IconProbe(),
    left: const Text('Primary panel'),
    right: const Text('Supporting panel'),
    actions: SolarButtonGroup(
      type: regular
          ? SolarButtonGroupType.regular
          : SolarButtonGroupType.fullWidth,
      // Figma's regular group hides its tertiary, as the Button Group's does.
      children: regular
          ? [
              button('secondaryCTA', SolarButtonPrio.secondary),
              button('button3', SolarButtonPrio.primary),
            ]
          : [
              button('tertiaryCTA', SolarButtonPrio.secondary),
              button('secondaryCTA', SolarButtonPrio.primary),
            ],
    ),
    onClose: () {},
  );
}
