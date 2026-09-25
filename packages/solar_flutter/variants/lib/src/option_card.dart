import 'package:flutter/material.dart';
import 'package:solar_flutter/solar_flutter.dart';

/// SolarOptionCard in one oracle variant, named as the web case is: Figma's words, pressable so a
/// hover is forced through [states]; as wide as Figma draws it.
Widget buildOptionCard(
  Map<String, dynamic> v,
  WidgetStatesController states, [
  Map<String, dynamic>? _,
]) {
  final props = v['props'] as Map<String, dynamic>;
  return SizedBox(
    width: 240,
    child: SolarOptionCard(
      selected: props['selected'] as bool,
      label: 'New design',
      onPressed: () {},
      statesController: states,
    ),
  );
}
