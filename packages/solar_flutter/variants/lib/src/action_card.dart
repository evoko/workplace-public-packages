import 'package:flutter/material.dart';
import 'package:solar_flutter/solar_flutter.dart';

import 'button.dart';
import 'probes.dart';

/// SolarActionCard in one oracle variant, named as the web case is: Figma's words, an icon probe,
/// the Buttons each status draws (built as the Button check builds one), a More menu, pressable so
/// a hover is forced through [states]; as wide as Figma draws it.
Widget buildActionCard(
  Map<String, dynamic> v,
  WidgetStatesController states, [
  Map<String, dynamic>? _,
]) {
  final props = v['props'] as Map<String, dynamic>;
  final layers = v['layers'] as Map<String, dynamic>;
  Widget button(String layer) {
    final b =
        ((layers[layer] as Map<String, dynamic>?)?['variant']
            as Map<String, dynamic>?) ??
        const {};
    return buildButton({
      'props': {
        'size': b['size'] ?? 'sm',
        'variant': b['prio'] ?? 'primary',
        'danger': b['danger'] == 'true',
        'disabled': false,
        'loading': false,
      },
    }, WidgetStatesController());
  }

  final status = props['status'] as String;
  return SizedBox(
    width: 300,
    child: SolarActionCard(
      status: enumNamed(SolarActionCardStatus.values, status, (s) => s.figma),
      title: 'Label',
      icon: const IconProbe(),
      description: 'Description goes here',
      primaryAction: button(status == 'default' ? 'primaryCTA' : 'button'),
      secondaryAction: button('secondaryCTA'),
      moreItems: [SolarCardMoreItem(label: 'Dismiss', onSelected: () {})],
      onPressed: () {},
      statesController: states,
    ),
  );
}
