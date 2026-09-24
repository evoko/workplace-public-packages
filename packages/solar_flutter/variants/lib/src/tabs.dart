import 'package:flutter/material.dart';
import 'package:solar_flutter/solar_flutter.dart';

import 'probes.dart';

/// SolarTabs in one oracle variant, named as the web case is: Figma's tabs, each keyed by its
/// layer, words alone as Figma's strip draws them (its icons and counter hidden: the oracle's
/// hides), the one Figma draws selected the strip's value. A strip has no states of its own.
Widget buildTabs(
  Map<String, dynamic> v,
  WidgetStatesController _, [
  Map<String, dynamic>? _,
]) {
  final props = v['props'] as Map<String, dynamic>;
  final layers = (v['layers'] as Map<String, dynamic>?) ?? const {};
  final tabs = [
    for (final MapEntry(key: name, value: l) in layers.entries)
      if ((l as Map<String, dynamic>)['component'] == 'Tab Item')
        (name, (l['variant'] as Map<String, dynamic>)['state']),
  ];
  return SolarTabs(
    size: enumNamed(SolarTabsSize.values, props['size'] as String),
    value: tabs.where((t) => t.$2 == 'selected').firstOrNull?.$1,
    onChanged: (_) {},
    children: [
      for (final (name, _) in tabs)
        KeyedSubtree(
          key: Key(name),
          child: SolarTabItem(label: 'Tab', value: name),
        ),
    ],
  );
}
