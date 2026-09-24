import 'package:flutter/material.dart';
import 'package:solar_flutter/solar_flutter.dart';

import 'probes.dart';

/// SolarAlertSmall in one oracle variant, every slot filled with Figma's own words, in Figma's sample
/// width, which the overlay makes the caller's. It has no states.
Widget buildAlertSmall(
  Map<String, dynamic> v,
  WidgetStatesController _, [
  Map<String, dynamic>? _,
]) {
  final props = v['props'] as Map<String, dynamic>;
  final root =
      (v['layers'] as Map<String, dynamic>)['root'] as Map<String, dynamic>;
  return SizedBox(
    width: (root['width'] as num).toDouble(),
    child: SolarAlertSmall(
      type: enumNamed(
        SolarAlertSmallType.values,
        props['type'] as String,
        (t) => t.figma,
      ),
      variant: enumNamed(
        SolarAlertSmallVariant.values,
        props['variant'] as String,
      ),
      title: 'Label',
      description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
      action: 'Action',
      onAction: () {},
    ),
  );
}
