import 'package:flutter/material.dart';
import 'package:solar_flutter/solar_flutter.dart';

/// SolarAccordion in one oracle variant, named as the web case is: Figma's words, expanded or not
/// as the variant is, the pointer over it forced through [states]; as wide as Figma draws it.
Widget buildAccordion(
  Map<String, dynamic> v,
  WidgetStatesController states, [
  Map<String, dynamic>? _,
]) {
  final props = v['props'] as Map<String, dynamic>;
  return SizedBox(
    width: 400,
    child: SolarAccordion(
      expanded: props['expanded'] as bool,
      disabled: props['disabled'] as bool,
      onExpandedChanged: (_) {},
      title: 'Label',
      description: 'Content',
      statesController: states,
    ),
  );
}
