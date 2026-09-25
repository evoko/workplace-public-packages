import 'package:flutter/material.dart';
import 'package:solar_flutter/solar_flutter.dart';

import 'probes.dart';

/// SolarTimeSlot in one oracle variant, named as the web case is: each state and density,
/// pressable, so its hover is reached as a user reaches it, in Figma's 160 (it fills its column).
Widget buildTimeSlot(
  Map<String, dynamic> v,
  WidgetStatesController states, [
  Map<String, dynamic>? _,
]) {
  final props = v['props'] as Map<String, dynamic>;
  return SizedBox(
    width: 160,
    child: SolarTimeSlot(
      selected: props['selected'] == true,
      density: enumNamed(
        SolarTimeSlotDensity.values,
        props['density'] as String,
      ),
      onPressed: () {},
      statesController: states,
    ),
  );
}
