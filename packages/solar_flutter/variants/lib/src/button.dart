import 'package:flutter/material.dart';
import 'package:solar_flutter/solar_flutter.dart';

import 'probes.dart';

/// SolarButton in one oracle variant: its props from the oracle, both icons and a counter, so their
/// colours are measured in every variant. The counter is a SolarCounter of the type Figma draws in
/// this variant, which takes the button's states.
Widget buildButton(
  Map<String, dynamic> v,
  WidgetStatesController states, [
  Map<String, dynamic>? _,
]) {
  final props = v['props'] as Map<String, dynamic>;
  // A button another widget builds (Button Group's) may come with its props alone.
  final counter =
      ((v['layers'] as Map<String, dynamic>?)?['counter']
              as Map<String, dynamic>?)?['variant']
          as Map<String, dynamic>?;
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
    counter: SolarCounter(
      key: const Key('counter'),
      type: enumNamed(
        SolarCounterType.values,
        counter?['type'] as String? ?? 'regular',
      ),
      count: 3,
    ),
    child: const Text('Label'),
  );
}
