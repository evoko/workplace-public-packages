import 'package:flutter/material.dart';
import 'package:solar_flutter/solar_flutter.dart';

import 'probes.dart';

/// SolarDropdown in one oracle variant, named as the web case is: every slot filled so its look is
/// measured, the label, starred, the helper and both icon probes; open where Figma draws it open
/// (its panel, a SolarDropdownMenu, Figma does not draw). Given onChanged, so a hover or focus is
/// forced through [states].
Widget buildDropdown(
  Map<String, dynamic> v,
  WidgetStatesController states, [
  Map<String, dynamic>? _,
]) {
  final props = v['props'] as Map<String, dynamic>;
  return SolarDropdown<String>(
    size: enumNamed(SolarDropdownSize.values, props['size'] as String),
    open: props['open'] as bool,
    enabled: !(props['disabled'] as bool),
    error: props['error'] as bool,
    label: 'Label',
    mandatory: true,
    helper: 'Helper text',
    placeholder: 'Label',
    leadingIcon: const IconProbe(),
    trailingIcon: const IconProbe(),
    options: const [
      SolarDropdownOption(value: 'one', label: 'Option'),
      SolarDropdownOption(value: 'two', label: 'Option'),
    ],
    onChanged: (_) {},
    statesController: states,
  );
}
