import 'package:flutter/material.dart';
import 'package:solar_flutter/solar_flutter.dart';

import 'probes.dart';

/// SolarRow in one oracle variant, named as the web case is: each type, at rest and selected, with
/// its select and expand cells and Figma's five cells, each its words: headers in the header row,
/// data cells in the others.
Widget buildRow(
  Map<String, dynamic> v,
  WidgetStatesController states, [
  Map<String, dynamic>? _,
]) {
  final props = v['props'] as Map<String, dynamic>;
  final type = enumNamed(
    SolarRowType.values,
    props['type'] as String,
    (t) => t.figma,
  );
  return SolarRow(
    type: type,
    selected: props['selected'] as bool,
    selectable: true,
    expandable: true,
    onSelectedChanged: (_) {},
    onExpandedChanged: (_) {},
    cells: [
      // The first stands for the five (Figma's `repeat`), keyed by its layer and checked as Figma
      // draws it.
      for (var i = 0; i < 5; i++)
        KeyedSubtree(
          key: i == 0 ? const Key('columnItem') : null,
          child: SolarColumnItem(
            header: type == SolarRowType.title,
            label: 'Label',
          ),
        ),
    ],
    statesController: states,
  );
}
