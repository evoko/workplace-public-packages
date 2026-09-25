import 'package:flutter/material.dart';
import 'package:solar_flutter/solar_flutter.dart';

import 'probes.dart';

/// SolarFAB in one oracle variant: its props from the oracle, an icon probe, and a label where the
/// variant fills it (an extended FAB).
Widget buildFAB(
  Map<String, dynamic> v,
  WidgetStatesController states, [
  Map<String, dynamic>? _,
]) {
  final props = v['props'] as Map<String, dynamic>;
  final extended = ((v['content'] as List?) ?? const []).contains('label');
  return SolarFAB(
    onPressed: props['disabled'] as bool ? null : () {},
    size: enumNamed(SolarFABSize.values, props['size'] as String),
    loading: props['loading'] as bool,
    statesController: states,
    icon: const IconProbe(key: Key('icon')),
    semanticLabel: 'Add',
    child: extended ? const Text('Label') : null,
  );
}
