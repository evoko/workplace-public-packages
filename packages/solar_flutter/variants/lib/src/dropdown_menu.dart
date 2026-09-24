import 'package:flutter/material.dart';
import 'package:solar_flutter/solar_flutter.dart';

import 'probes.dart';

/// SolarDropdownMenu in one oracle variant, holding the heading and rows Figma draws in it, in its
/// order, each keyed by its layer, every row's slots filled so its look is measured: the checkbox,
/// an icon probe and the second line. A menu has no states of its own.
Widget buildDropdownMenu(
  Map<String, dynamic> v,
  WidgetStatesController _, [
  Map<String, dynamic>? _,
]) {
  final props = v['props'] as Map<String, dynamic>;
  final layers = (v['layers'] as Map<String, dynamic>?) ?? const {};
  return SolarDropdownMenu(
    size: enumNamed(SolarDropdownMenuSize.values, props['size'] as String),
    children: [
      for (final MapEntry(key: name, value: l) in layers.entries)
        if ((l as Map<String, dynamic>)['component'] == 'Dropdown Group Label')
          KeyedSubtree(
            key: Key(name),
            child: const SolarDropdownGroupLabel(label: 'Group Label'),
          )
        else if (l['component'] == 'Dropdown Item')
          KeyedSubtree(
            key: Key(name),
            child: SolarDropdownItem(
              label: 'Label',
              helper: 'Description',
              icon: const IconProbe(),
              checkbox: true,
              onPressed: () {},
            ),
          ),
    ],
  );
}
