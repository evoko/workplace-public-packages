import 'package:flutter/material.dart';
import 'package:solar_flutter/solar_flutter.dart';

import 'controls.dart';
import 'probes.dart';

/// SolarTableHeader in one oracle variant, named as the web case is: each breakpoint with what
/// Figma draws in it: the bare md SearchField (its filter hidden), the md Segmented Control with no
/// label or helper (as the instance hides them), its six segments the first chosen, as the
/// Segmented Control's oracle draws md, each keyed by its layer; and three secondary Icon Buttons,
/// each keyed as the layer Figma draws it in.
Widget buildTableHeader(
  Map<String, dynamic> v,
  WidgetStatesController _, [
  Map<String, dynamic>? _,
]) {
  final props = v['props'] as Map<String, dynamic>;
  final layers = (v['layers'] as Map<String, dynamic>?) ?? const {};
  final breakpoint = enumNamed(
    SolarTableHeaderBreakpoint.values,
    props['breakpoint'] as String,
  );
  return SizedBox(
    // Wider than Figma's samples on mobile: its six-segment control at its own size.
    width: breakpoint == SolarTableHeaderBreakpoint.mobile ? 600 : 1020,
    child: SolarTableHeader(
      breakpoint: breakpoint,
      search: SolarSearchField(
        size: SolarSearchFieldSize.md,
        controller: TextEditingController(),
        placeholder: 'Search',
      ),
      segmentedControl: segmentedControlMd(),
      actions: [
        for (final MapEntry(key: layer, value: l) in layers.entries)
          if ((l as Map<String, dynamic>)['component'] == 'Icon Button')
            KeyedSubtree(
              key: ValueKey('tableHeader.$layer'),
              child: SolarIconButton(
                onPressed: () {},
                icon: const IconProbe(key: Key('icon')),
                semanticLabel: 'Action',
                size: SolarIconButtonSize.md,
                prio: SolarIconButtonPrio.secondary,
              ),
            ),
      ],
    ),
  );
}
