import 'package:flutter/material.dart';
import 'package:solar_flutter/solar_flutter.dart';

import 'probes.dart';

/// SolarTable in one oracle variant, named as the web case is: each breakpoint as Figma draws it,
/// as wide, the header row and five rows of Figma's first row's type, the first standing for
/// Figma's fifteen (its `repeat`), keyed by its layer; each row's first cell keyed by its own.
Widget buildTable(
  Map<String, dynamic> v,
  WidgetStatesController _, [
  Map<String, dynamic>? _,
]) {
  final props = v['props'] as Map<String, dynamic>;
  final layers = (v['layers'] as Map?)?.cast<String, dynamic>() ?? const {};
  final first =
      ((layers['row'] as Map?)?['variant'] as Map?)?['type'] as String;
  final type = enumNamed(SolarRowType.values, first, (t) => t.figma);
  final breakpoint = enumNamed(
    SolarTableBreakpoint.values,
    props['breakpoint'] as String,
  );
  // Figma's five cells, the first standing for them, keyed by its layer.
  List<Widget> cells(bool header) => [
    for (var i = 0; i < 5; i++)
      KeyedSubtree(
        key: i == 0 ? const Key('columnItem') : null,
        child: SolarColumnItem(header: header, label: 'Label'),
      ),
  ];
  return SizedBox(
    width: breakpoint == SolarTableBreakpoint.mobile ? 361 : 1020,
    child: SolarTable(
      breakpoint: breakpoint,
      expandable: props['expandable'] as bool,
      selectable: props['selectable'] as bool,
      header: SolarRow(type: SolarRowType.title, cells: cells(true)),
      rows: [
        for (var i = 0; i < 5; i++)
          KeyedSubtree(
            key: i == 0 ? const Key('row') : null,
            child: SolarRow(
              type: type,
              onExpandedChanged: (_) {},
              onSelectedChanged: (_) {},
              cells: cells(false),
            ),
          ),
      ],
    ),
  );
}
