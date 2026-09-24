import 'package:flutter/material.dart';
import 'package:solar_flutter/solar_flutter.dart';

import 'probes.dart';

/// SolarBackButton in one oracle variant, with Figma's own label, 'Back'.
Widget buildBackButton(
  Map<String, dynamic> v,
  WidgetStatesController states, [
  Map<String, dynamic>? _,
]) {
  final props = v['props'] as Map<String, dynamic>;
  return SolarBackButton(
    onPressed: () {},
    size: enumNamed(SolarBackButtonSize.values, props['size'] as String),
    disabled: props['disabled'] as bool,
    loading: props['loading'] as bool,
    statesController: states,
  );
}
