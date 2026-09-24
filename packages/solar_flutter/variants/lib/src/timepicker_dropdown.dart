import 'package:flutter/material.dart';
import 'package:solar_flutter/solar_flutter.dart';

import 'probes.dart';

/// SolarTimePickerDropdown in one oracle variant, named as the web case is: Figma's six rows, the
/// times from midnight half an hour apart, the first chosen, as Figma draws its first row
/// selected; each row keyed by its layer.
Widget buildTimePickerDropdown(
  Map<String, dynamic> v,
  WidgetStatesController states, [
  Map<String, dynamic>? _,
]) {
  final props = v['props'] as Map<String, dynamic>;
  final layers = [
    for (final MapEntry(key: name, value: l)
        in ((v['layers'] as Map<String, dynamic>?) ?? const {}).entries)
      if ((l as Map<String, dynamic>)['component'] == 'Dropdown Item') name,
  ];
  final last = (layers.length - 1) * 30;
  return SolarTimePickerDropdown(
    size: enumNamed(
      SolarTimePickerDropdownSize.values,
      props['size'] as String,
    ),
    value: const TimeOfDay(hour: 0, minute: 0),
    first: const TimeOfDay(hour: 0, minute: 0),
    last: TimeOfDay(hour: last ~/ 60, minute: last % 60),
    onChanged: (_) {},
    optionBuilder: (time, row) => KeyedSubtree(
      key: ValueKey(layers[(time.hour * 60 + time.minute) ~/ 30]),
      child: row,
    ),
  );
}
