import 'package:flutter/material.dart';
import 'package:solar_flutter/solar_flutter.dart';

/// SolarRowSelect in one oracle variant, named as the web case is: the header row's cell and a
/// row's, each unchecked as Figma draws them.
Widget buildRowSelect(
  Map<String, dynamic> v,
  WidgetStatesController _, [
  Map<String, dynamic>? _,
]) {
  final props = v['props'] as Map<String, dynamic>;
  return SolarRowSelect(header: props['header'] as bool, onChanged: (_) {});
}
