import 'package:flutter/material.dart';
import 'package:solar_flutter/solar_flutter.dart';

/// SolarExpandableCard in one oracle variant, named as the web case is: Figma's words, expanded or
/// not as the variant is, its header's hover forced through [states]; as wide as Figma draws it.
Widget buildExpandableCard(
  Map<String, dynamic> v,
  WidgetStatesController states, [
  Map<String, dynamic>? _,
]) {
  final props = v['props'] as Map<String, dynamic>;
  return SizedBox(
    width: 320,
    child: SolarExpandableCard(
      expanded: props['expanded'] as bool,
      onExpandedChanged: (_) {},
      title: 'Label',
      description: 'Content',
      statesController: states,
    ),
  );
}
