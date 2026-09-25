import 'package:flutter/material.dart';
import 'package:solar_flutter/solar_flutter.dart';

import 'propertyrow.dart';

/// SolarPropertyList in one oracle variant, named as the web case is: Figma's rows and dividers,
/// each keyed by its layer, so the list draws none of its own; each row given the control its
/// trailing names, as the PropertyRow builder gives it.
Widget buildPropertyList(
  Map<String, dynamic> v,
  WidgetStatesController _, [
  Map<String, dynamic>? _,
]) {
  final props = v['props'] as Map<String, dynamic>;
  final layers = (v['layers'] as Map<String, dynamic>?) ?? const {};
  return SolarPropertyList(
    inCard: props['inCard'] as bool,
    dividers: false,
    children: [
      for (final MapEntry(key: name, value: l) in layers.entries)
        if ((l as Map<String, dynamic>)['component'] == 'Divider')
          KeyedSubtree(key: Key(name), child: const SolarDivider())
        else if (l['component'] == 'PropertyRow')
          KeyedSubtree(
            key: Key(name),
            child: propertyRow(
              ((l['variant'] as Map?)?['trailing'] as String?) ?? 'none',
            ),
          ),
    ],
  );
}
