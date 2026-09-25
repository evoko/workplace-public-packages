import 'package:flutter/material.dart';
import 'package:solar_flutter/solar_flutter.dart';

import 'probes.dart';

/// SolarAllDayBar in one oracle variant, named as the web case is: each variant and span with
/// Figma's words and time, at the width Figma draws the span (it fills the columns it spans).
Widget buildAllDayBar(
  Map<String, dynamic> v,
  WidgetStatesController _, [
  Map<String, dynamic>? _,
]) {
  final props = v['props'] as Map<String, dynamic>;
  final root = (v['layers'] as Map<String, dynamic>)['root'] as Map;
  return SizedBox(
    width: (root['width'] as num).toDouble(),
    child: SolarAllDayBar(
      variant: enumNamed(
        SolarAllDayBarVariant.values,
        props['variant'] as String,
      ),
      span: enumNamed(SolarAllDayBarSpan.values, props['span'] as String),
      title: 'Conference week',
      time: 'All day',
    ),
  );
}
