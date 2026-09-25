import 'package:flutter/material.dart';
import 'package:solar_flutter/solar_flutter.dart';

import 'probes.dart';

/// SolarSplitButton in one oracle variant, with Figma's own label, its states forced through
/// [states], which both halves drive.
Widget buildSplitButton(
  Map<String, dynamic> v,
  WidgetStatesController states, [
  Map<String, dynamic>? _,
]) {
  final props = v['props'] as Map<String, dynamic>;
  return SolarSplitButton(
    label: 'Label',
    onPressed: props['disabled'] as bool ? null : () {},
    onMenuPressed: () {},
    variant: enumNamed(
      SolarSplitButtonVariant.values,
      props['variant'] as String,
    ),
    size: enumNamed(SolarSplitButtonSize.values, props['size'] as String),
    loading: props['loading'] as bool,
    statesController: states,
  );
}
