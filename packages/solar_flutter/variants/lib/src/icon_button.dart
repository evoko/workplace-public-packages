import 'package:flutter/material.dart';
import 'package:solar_flutter/solar_flutter.dart';

import 'probes.dart';

/// SolarIconButton in one oracle variant: its props from the oracle, and a probe for the icon, so
/// the colour and size the button gives an icon are measured.
Widget buildIconButton(
  Map<String, dynamic> v,
  WidgetStatesController states, [
  Map<String, dynamic>? _,
]) {
  final props = v['props'] as Map<String, dynamic>;
  return SolarIconButton(
    onPressed: props['disabled'] as bool ? null : () {},
    semanticLabel: 'Icon',
    size: enumNamed(SolarIconButtonSize.values, props['size'] as String),
    shape: enumNamed(SolarIconButtonShape.values, props['shape'] as String),
    prio: enumNamed(SolarIconButtonPrio.values, props['prio'] as String),
    loading: props['loading'] as bool,
    statesController: states,
    icon: const IconProbe(key: Key('icon')),
  );
}
