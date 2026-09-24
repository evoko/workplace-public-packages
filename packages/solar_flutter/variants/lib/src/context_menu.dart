import 'package:flutter/material.dart';
import 'package:solar_flutter/solar_flutter.dart';

import 'probes.dart';

/// SolarContextMenu in one oracle variant, holding the rows and divider Figma draws in it, in its
/// order, each keyed by its layer, every row's slots filled so its look is measured: both icons and
/// the shortcut; a destructive row where Figma draws one. A menu has no states of its own.
Widget buildContextMenu(
  Map<String, dynamic> v,
  WidgetStatesController _, [
  Map<String, dynamic>? _,
]) {
  final layers = (v['layers'] as Map<String, dynamic>?) ?? const {};
  return SolarContextMenu(
    children: [
      for (final MapEntry(key: name, value: l) in layers.entries)
        if ((l as Map<String, dynamic>)['component'] == 'Divider')
          KeyedSubtree(key: Key(name), child: const SolarDivider())
        else if (l['component'] == 'Context Menu Item')
          KeyedSubtree(
            key: Key(name),
            child: SolarContextMenuItem(
              label: 'Action',
              destructive:
                  (l['variant'] as Map<String, dynamic>)['destructive'] ==
                  'true',
              leadingIcon: const IconProbe(),
              trailingIcon: const IconProbe(),
              shortcut: '⌘K',
              onPressed: () {},
            ),
          ),
    ],
  );
}
