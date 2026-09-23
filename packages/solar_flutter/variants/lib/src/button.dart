import 'package:flutter/material.dart';
import 'package:solar_flutter/solar_flutter.dart';

import 'probes.dart';

/// SolarButton in one oracle variant: its props from the oracle, both icons and a counter, so their
/// colours are measured in every variant.
Widget buildButton(Map<String, dynamic> v, WidgetStatesController states) {
  final props = v['props'] as Map<String, dynamic>;
  return SolarButton(
    onPressed: () {},
    size: enumNamed(SolarButtonSize.values, props['size'] as String),
    variant: enumNamed(SolarButtonVariant.values, props['variant'] as String),
    danger: props['danger'] as bool,
    disabled: props['disabled'] as bool,
    loading: props['loading'] as bool,
    statesController: states,
    iconLeading: const IconProbe(key: Key('lead')),
    iconTrailing: const IconProbe(key: Key('trail')),
    counter: const Text('3', key: Key('counter')),
    child: const Text('Label'),
  );
}
