import 'package:flutter/material.dart';
import 'package:solar_flutter/solar_flutter.dart';

import 'probes.dart';

/// SolarSpinner in one oracle variant. It has no platform states.
Widget buildSpinner(Map<String, dynamic> v, WidgetStatesController _) {
  final props = v['props'] as Map<String, dynamic>;
  return SolarSpinner(
    size: enumNamed(SolarSpinnerSize.values, props['size'] as String),
    variant: enumNamed(
      SolarSpinnerVariant.values,
      props['variant'] as String,
      (v) => v.figma,
    ),
  );
}
