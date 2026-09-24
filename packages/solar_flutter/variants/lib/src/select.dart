import 'package:flutter/material.dart';
import 'package:solar_flutter/solar_flutter.dart';

import 'probes.dart';

/// SolarSelect in one oracle variant, named as the web case is: every slot filled so its look is
/// measured, the label, starred, and the helper; open where Figma draws it open, with Figma's rows,
/// each keyed by its layer and disabled where Figma draws it so. Given onChanged, so a hover or
/// focus is forced through [states].
Widget buildSelect(
  Map<String, dynamic> v,
  WidgetStatesController states, [
  Map<String, dynamic>? _,
]) {
  final props = v['props'] as Map<String, dynamic>;
  final layers = (v['layers'] as Map<String, dynamic>?) ?? const {};
  final rows = [
    for (final MapEntry(key: name, value: l) in layers.entries)
      if ((l as Map<String, dynamic>)['component'] == 'Dropdown Item')
        (name, (l['variant'] as Map<String, dynamic>)['state']),
  ];
  return SolarSelect<String>(
    size: enumNamed(SolarSelectSize.values, props['size'] as String),
    open: props['open'] as bool,
    disabled: props['disabled'] as bool,
    error: props['error'] as bool,
    label: 'Label',
    mandatory: true,
    helper: 'Helper text',
    placeholder: 'Select…',
    options: [
      for (final (name, state) in rows)
        SolarSelectOption(
          value: name,
          label: 'Option',
          disabled: state == 'disabled',
          key: Key(name),
        ),
    ],
    onChanged: (_) {},
    statesController: states,
  );
}
