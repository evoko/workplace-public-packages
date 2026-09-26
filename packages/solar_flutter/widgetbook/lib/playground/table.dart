// Table's Playground: its breakpoint, and whether its rows draw their select and expand cells, from
// their controls; its header, a Row of type title over the sample columns, shown by the `header`
// toggle; its rows, three sample devices, shown by the `rows` toggle. Live as an app's table: a
// row's select cell selects it and the header's selects every row (mixed where some are), which
// the `selected` extra follows, the selected rows' names comma-separated; expandable, the first
// device is a group's top row, its expand button showing the other two (middle and bottom), which
// `expanded` follows. A row's press is logged with its name. As the web's
// (stories/playground/table.tsx).

import 'package:solar_flutter/solar_flutter.dart';

import 'playground.dart';
import 'samples.dart';
import 'tables.dart';

final _names = [for (final d in sampleDevices) d.$1];

final tablePlayground = SolarPlaygroundBuilder(
  build: (p) {
    final expandable = p.flag('expandable');
    final selected = namedIn(p.text('selected'));
    final expanded = p.flag('expanded');
    final all = _names.every(selected.contains);
    final some = _names.any(selected.contains);
    void select(String name, bool on) {
      final next = [
        for (final n in _names)
          if (n == name ? on : selected.contains(n)) n,
      ];
      p.set('selected', next.join(', '));
      p.log('onSelectedChanged', {name: on});
    }

    // Expandable, the first device heads a group of the other two.
    SolarRowType typeOf(int i) => !expandable
        ? SolarRowType.nonExpandable
        : i == 0
        ? SolarRowType.top
        : i == sampleDevices.length - 1
        ? SolarRowType.bottom
        : SolarRowType.middle;
    return SolarTable(
      breakpoint: p.choice('breakpoint', SolarTableBreakpoint.values),
      expandable: expandable,
      selectable: p.flag('selectable'),
      header: p.child('header').shown
          ? SolarRow(
              type: SolarRowType.title,
              selected: all,
              mixed: some && !all,
              onSelectedChanged: (on) {
                p.set('selected', on ? _names.join(', ') : '');
                p.log('onSelectedChanged', on);
              },
              cells: headerCells(),
            )
          : null,
      rows: [
        if (p.flag('rows'))
          for (final (i, device) in sampleDevices.indexed)
            if (!expandable || i == 0 || expanded)
              SolarRow(
                type: typeOf(i),
                selected: selected.contains(device.$1),
                selectLabel: 'Select ${device.$1}',
                onSelectedChanged: (on) => select(device.$1, on),
                expanded: expanded,
                onExpandedChanged: (next) {
                  p.set('expanded', next);
                  p.log('onExpandedChanged', next);
                },
                onPressed: () => p.log('onPressed', device.$1),
                cells: deviceCells(device),
              ),
      ],
    );
  },
);
