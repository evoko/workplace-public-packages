import 'package:flutter/material.dart';
import 'package:solar_flutter/solar_flutter.dart';

import 'probes.dart';

/// SolarOptionRow in one oracle variant, named as the web case is: each control off, with its
/// words and the second line; a radio in a group, as a radio always is.
Widget buildOptionRow(
  Map<String, dynamic> v,
  WidgetStatesController _, [
  Map<String, dynamic>? _,
]) {
  final props = v['props'] as Map<String, dynamic>;
  return RadioGroup<String>(
    groupValue: null,
    onChanged: (_) {},
    child: SolarOptionRow<String>(
      control: enumNamed(
        SolarOptionRowControl.values,
        props['control'] as String,
      ),
      label: 'Label',
      supportingText: 'Supporting text',
      onChanged: (_) {},
      value: 'option',
    ),
  );
}
