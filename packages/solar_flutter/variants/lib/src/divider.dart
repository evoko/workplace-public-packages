import 'package:flutter/material.dart';
import 'package:solar_flutter/solar_flutter.dart';

import 'probes.dart';

/// SolarDivider in one oracle variant, in Figma's sample box (320 wide, or 32 tall), which it
/// fills. It has no states.
Widget buildDivider(
  Map<String, dynamic> v,
  WidgetStatesController _, [
  Map<String, dynamic>? _,
]) {
  final props = v['props'] as Map<String, dynamic>;
  final orientation = enumNamed(
    SolarDividerOrientation.values,
    props['orientation'] as String,
  );
  final type = enumNamed(
    SolarDividerType.values,
    props['type'] as String,
    (v) => v.figma,
  );
  final divider = SolarDivider(
    orientation: orientation,
    type: type,
    label: type == SolarDividerType.withLabel ? 'Or' : null,
  );
  return orientation == SolarDividerOrientation.vertical
      ? SizedBox(height: 32, child: divider)
      : SizedBox(width: 320, child: divider);
}
