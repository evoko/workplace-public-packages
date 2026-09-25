import 'package:flutter/material.dart';
import 'package:solar_flutter/solar_flutter.dart';

import 'probes.dart';

/// SolarEventChip in one oracle variant, named as the web case is: each category and variant with
/// Figma's words and time, repeating, so the icon its prop shows is drawn and checked too, in
/// Figma's 160 (it fills its width).
Widget buildEventChip(
  Map<String, dynamic> v,
  WidgetStatesController _, [
  Map<String, dynamic>? _,
]) {
  final props = v['props'] as Map<String, dynamic>;
  return SizedBox(
    width: 160,
    child: SolarEventChip(
      category: enumNamed(
        SolarEventChipCategory.values,
        props['category'] as String,
      ),
      variant: enumNamed(
        SolarEventChipVariant.values,
        props['variant'] as String,
      ),
      title: 'Event title',
      time: '9:00',
      repeating: true,
    ),
  );
}
