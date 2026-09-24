import 'package:flutter/material.dart';
import 'package:solar_flutter/solar_flutter.dart';

import 'probes.dart';

/// SolarOptionsList in one oracle variant, holding the rows Figma draws in it, in its order, each
/// keyed by its layer, in the control Figma draws, off, with its words and the second line.
Widget buildOptionsList(
  Map<String, dynamic> v,
  WidgetStatesController _, [
  Map<String, dynamic>? _,
]) {
  final layers = (v['layers'] as Map<String, dynamic>?) ?? const {};
  return SolarOptionsList(
    label: 'Options',
    children: [
      for (final MapEntry(key: name, value: l) in layers.entries)
        if ((l as Map<String, dynamic>)['component'] == 'Option Row')
          KeyedSubtree(
            key: Key(name),
            child: SolarOptionRow<String>(
              control: enumNamed(
                SolarOptionRowControl.values,
                (l['variant'] as Map<String, dynamic>)['control'] as String,
              ),
              label: 'Label',
              supportingText: 'Supporting text',
              onChanged: (_) {},
            ),
          ),
    ],
  );
}
