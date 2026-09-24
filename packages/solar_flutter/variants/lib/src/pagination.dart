import 'package:flutter/material.dart';
import 'package:solar_flutter/solar_flutter.dart';

/// SolarPagination in its one oracle variant, named as the web case is: Figma's pages, the first of
/// twelve, drawn 1 2 3 … 12. It has no states of its own.
Widget buildPagination(
  Map<String, dynamic> v,
  WidgetStatesController _, [
  Map<String, dynamic>? _,
]) => SolarPagination(count: 12, page: 1, onChanged: (_) {});
