import 'package:flutter/material.dart';
import 'package:solar_flutter/solar_flutter.dart';

import 'probes.dart';

/// SolarSegmentedControlItem in one oracle variant: in a group whose value is this one's where
/// Figma draws it selected, both icons probes, with Figma's own words; forced into a state through
/// [states].
Widget buildSegmentedControlItem(
  Map<String, dynamic> v,
  WidgetStatesController states, [
  Map<String, dynamic>? _,
]) {
  final props = v['props'] as Map<String, dynamic>;
  return RadioGroup<String>(
    groupValue: props['selected'] as bool ? 'option' : null,
    onChanged: (_) {},
    child: SolarSegmentedControlItem<String>(
      value: 'option',
      label: 'Label',
      size: enumNamed(
        SolarSegmentedControlItemSize.values,
        props['size'] as String,
      ),
      iconLeading: const IconProbe(),
      iconTrailing: const IconProbe(),
      statesController: states,
    ),
  );
}
