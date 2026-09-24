import 'package:flutter/material.dart';
import 'package:solar_flutter/solar_flutter.dart';

/// SolarPageNavigator in its one oracle variant, named as the web case is: Figma's position, the
/// first of ten. It has no states of its own.
Widget buildPageNavigator(
  Map<String, dynamic> v,
  WidgetStatesController _, [
  Map<String, dynamic>? _,
]) => SolarPageNavigator(count: 10, page: 1, onChanged: (_) {});
