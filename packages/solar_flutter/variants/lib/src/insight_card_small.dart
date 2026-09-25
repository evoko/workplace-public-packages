import 'package:flutter/material.dart';
import 'package:solar_flutter/solar_flutter.dart';

import 'probes.dart';

/// SolarInsightCardSmall in one oracle variant, named as the web case is: Figma's words,
/// pressable so a hover is forced through [states]; as wide as Figma draws it.
Widget buildInsightCardSmall(
  Map<String, dynamic> v,
  WidgetStatesController states, [
  Map<String, dynamic>? _,
]) {
  final props = v['props'] as Map<String, dynamic>;
  return SizedBox(
    width: 320,
    child: SolarInsightCardSmall(
      severity: enumNamed(
        SolarInsightCardSmallSeverity.values,
        props['severity'] as String,
      ),
      loading: props['loading'] as bool,
      title: 'Label',
      description: 'Description goes here',
      onPressed: () {},
      statesController: states,
    ),
  );
}
