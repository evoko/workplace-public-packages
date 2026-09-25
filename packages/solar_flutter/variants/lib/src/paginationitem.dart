import 'package:flutter/material.dart';
import 'package:solar_flutter/solar_flutter.dart';

/// SolarPaginationItem in one oracle variant, named as the web case is: Figma's page number;
/// given onPressed, so a hover, press or focus is forced through [states].
Widget buildPaginationItem(
  Map<String, dynamic> v,
  WidgetStatesController states, [
  Map<String, dynamic>? _,
]) {
  final props = v['props'] as Map<String, dynamic>;
  return SolarPaginationItem(
    selected: props['selected'] as bool,
    page: 1,
    onPressed: props['disabled'] as bool ? null : () {},
    statesController: states,
  );
}
