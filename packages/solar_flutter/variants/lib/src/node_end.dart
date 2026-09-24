import 'package:flutter/material.dart';
import 'package:solar_flutter/solar_flutter.dart';

/// SolarNodeEnd in one oracle variant. It has no states.
Widget buildNodeEnd(
  Map<String, dynamic> v,
  WidgetStatesController _, [
  Map<String, dynamic>? _,
]) {
  final props = v['props'] as Map<String, dynamic>;
  return SolarNodeEnd(halo: props['halo'] as bool);
}
