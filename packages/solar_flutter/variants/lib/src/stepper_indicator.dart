import 'package:flutter/material.dart';
import 'package:solar_flutter/solar_flutter.dart';

import 'probes.dart';

/// SolarStepperIndicator in one oracle variant, named as the web case is: Figma's number. It has no
/// states.
Widget buildStepperIndicator(
  Map<String, dynamic> v,
  WidgetStatesController _, [
  Map<String, dynamic>? _,
]) => SolarStepperIndicator(
  status: enumNamed(
    SolarStepperIndicatorStatus.values,
    (v['props'] as Map<String, dynamic>)['status'] as String,
  ),
  number: 1,
);
