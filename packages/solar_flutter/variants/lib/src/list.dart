import 'package:flutter/material.dart';
import 'package:solar_flutter/solar_flutter.dart';

import 'probes.dart';

/// SolarList in one oracle variant, holding Figma's rows and dividers, each keyed by its layer, so
/// the list draws none of its own; every row's slots filled so its look is measured: an icon probe,
/// the second line and a trailing icon probe.
Widget buildList(
  Map<String, dynamic> v,
  WidgetStatesController _, [
  Map<String, dynamic>? _,
]) {
  final props = v['props'] as Map<String, dynamic>;
  final layers = (v['layers'] as Map<String, dynamic>?) ?? const {};
  return SolarList(
    inCard: props['inCard'] as bool,
    dividers: false,
    children: [
      for (final MapEntry(key: name, value: l) in layers.entries)
        if ((l as Map<String, dynamic>)['component'] == 'Divider')
          KeyedSubtree(key: Key(name), child: const SolarDivider())
        else if (l['component'] == 'ListItem')
          KeyedSubtree(
            key: Key(name),
            child: SolarListItem(
              label: 'Label',
              helper: 'Supporting text',
              icon: const IconProbe(),
              trailing: const IconProbe(),
              onPressed: () {},
            ),
          ),
    ],
  );
}
