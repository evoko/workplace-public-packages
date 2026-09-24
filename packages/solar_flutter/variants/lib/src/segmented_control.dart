import 'package:flutter/material.dart';
import 'package:solar_flutter/solar_flutter.dart';

import 'probes.dart';

/// SolarSegmentedControl in one oracle variant, holding the segments Figma draws in it, in its
/// order, each keyed by its layer, with Figma's own words; the one Figma draws selected is chosen.
/// Every slot is filled so its look is measured: the label, starred, the helper, and both icons of
/// every segment.
Widget buildSegmentedControl(
  Map<String, dynamic> v,
  WidgetStatesController _, [
  Map<String, dynamic>? _,
]) {
  final props = v['props'] as Map<String, dynamic>;
  final layers = (v['layers'] as Map<String, dynamic>?) ?? const {};
  final segments = [
    for (final MapEntry(key: name, value: l) in layers.entries)
      if ((l as Map<String, dynamic>)['component'] == 'Segmented Control Item')
        (name, l['variant'] as Map<String, dynamic>),
  ];
  return SolarSegmentedControl<String>(
    size: enumNamed(SolarSegmentedControlSize.values, props['size'] as String),
    groupValue: [
      for (final (name, variant) in segments)
        if (variant['selected'] == 'true') name,
    ].firstOrNull,
    onChanged: (_) {},
    label: 'Label',
    mandatory: true,
    helper: 'Helper text',
    children: [
      for (final (name, variant) in segments)
        KeyedSubtree(
          key: Key(name),
          child: SolarSegmentedControlItem<String>(
            value: name,
            label: 'Label',
            size: enumNamed(
              SolarSegmentedControlItemSize.values,
              variant['size'] as String,
            ),
            iconLeading: const IconProbe(),
            iconTrailing: const IconProbe(),
          ),
        ),
    ],
  );
}
