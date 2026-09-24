import 'package:flutter/material.dart';
import 'package:solar_flutter/solar_flutter.dart';

import 'probes.dart';

/// SolarDropdownGroupLabel in one oracle variant, with Figma's words. A heading has no states.
Widget buildDropdownGroupLabel(
  Map<String, dynamic> v,
  WidgetStatesController _, [
  Map<String, dynamic>? _,
]) {
  final props = v['props'] as Map<String, dynamic>;
  return SolarDropdownGroupLabel(
    size: enumNamed(
      SolarDropdownGroupLabelSize.values,
      props['size'] as String,
    ),
    label: 'Group Label',
  );
}
