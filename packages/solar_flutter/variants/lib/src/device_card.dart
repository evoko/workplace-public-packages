import 'package:flutter/material.dart';
import 'package:solar_flutter/solar_flutter.dart';

import 'button.dart';
import 'probes.dart';

/// SolarDeviceCard in one oracle variant, named as the web case is: Figma's words, its "Try
/// again" Button and a batch's Dropdown, each built as its own check builds one, pressable so its
/// states are forced through [states]; as wide as Figma draws it.
Widget buildDeviceCard(
  Map<String, dynamic> v,
  WidgetStatesController states, [
  Map<String, dynamic>? _,
]) {
  final props = v['props'] as Map<String, dynamic>;
  return SizedBox(
    width: 560,
    child: SolarDeviceCard(
      type: enumNamed(SolarDeviceCardType.values, props['type'] as String),
      loading: props['loading'] as bool,
      name: 'Cambridge Qt X',
      details: 'Sound masking · PL5432109 · Auditorium 100',
      count: '3 devices',
      tag: 'Online',
      action: buildButton({
        'props': {
          'size': 'sm',
          'variant': 'secondary',
          'danger': false,
          'disabled': false,
          'loading': false,
        },
      }, WidgetStatesController()),
      devices: SolarDropdown<String>(
        size: SolarDropdownSize.md,
        placeholder: 'Label',
        options: const [SolarDropdownOption(value: 'one', label: 'Option')],
        onChanged: (_) {},
      ),
      onPressed: () {},
      statesController: states,
    ),
  );
}
