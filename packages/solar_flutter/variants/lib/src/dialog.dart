import 'package:flutter/material.dart';
import 'package:solar_flutter/solar_flutter.dart';

import 'probes.dart';
import 'stepper.dart';

/// SolarDialog in one oracle variant, named as the web case is: each type with what Figma draws in
/// it (the oracle's content): its title and an icon probe, a picture probe and the words under the
/// title for the image dialog, the Stepper Figma draws for the wizard (as the Stepper builder draws
/// line+text), and the full-width Button Group, its Buttons keyed as the Button Group check keys
/// them; closable, so its close button is drawn.
Widget buildDialog(
  Map<String, dynamic> v,
  WidgetStatesController _, [
  Map<String, dynamic>? _,
]) {
  final content = ((v['content'] as List?) ?? const []).cast<String>();
  Widget button(String layer, SolarButtonPrio prio) => KeyedSubtree(
    key: Key(layer),
    child: SolarButton(
      onPressed: () {},
      size: SolarButtonSize.lg,
      prio: prio,
      child: const Text('Label'),
    ),
  );
  return SolarDialog(
    title: 'Dialog Title',
    icon: const IconProbe(),
    image: content.contains('modalImage') ? pictureProbe : null,
    description: content.contains('modalImage')
        ? 'Biamp delivers professional audio-visual solutions.'
        : null,
    stepper: content.contains('stepper')
        ? buildStepper({
            'props': {'type': 'line+text'},
          }, WidgetStatesController())
        : null,
    actions: SolarButtonGroup(
      type: SolarButtonGroupType.fullWidth,
      children: [
        button('tertiaryCTA', SolarButtonPrio.secondary),
        button('secondaryCTA', SolarButtonPrio.primary),
      ],
    ),
    onClose: () {},
  );
}
