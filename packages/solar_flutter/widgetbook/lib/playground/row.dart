// Row's Playground: a row is drawn in its Table, which says whether it draws its select cell and
// its expand cell (the `checkBox` and `expand` toggles); a title row is the table's header, any
// other sits under a sample header row. Its cells, the sample columns' names or a sample device's
// words, shown by `titleRowContent`. Live as a table's row: its select cell selects it (the sample
// header's too, standing for the one row), which `selected` follows; a top row's expand button
// shows its group, which the `expanded` extra follows; its press is logged. As the web's
// (stories/playground/row.tsx).

import 'package:solar_flutter/solar_flutter.dart';

import 'playground.dart';
import 'samples.dart';
import 'tables.dart';

final rowPlayground = SolarPlaygroundBuilder(
  build: (p) {
    final type = p.choice('type', SolarRowType.values);
    final selected = p.flag('selected');
    final content = p.flag('titleRowContent');
    final title = type == SolarRowType.title;
    void select(bool on) {
      p.set('selected', on);
      p.log('onSelectedChanged', on);
    }

    final row = SolarRow(
      type: type,
      selected: selected,
      onSelectedChanged: select,
      expanded: p.flag('expanded'),
      onExpandedChanged: (next) {
        p.set('expanded', next);
        p.log('onExpandedChanged', next);
      },
      onPressed: title ? null : () => p.log('onPressed'),
      cells: content
          ? (title ? headerCells() : deviceCells(sampleDevices.first))
          : const [],
    );
    return SolarTable(
      selectable: p.child('checkBox').shown,
      expandable: p.child('expand').shown,
      header: title
          ? row
          : SolarRow(
              type: SolarRowType.title,
              selected: selected,
              onSelectedChanged: select,
              cells: headerCells(),
            ),
      rows: [if (!title) row],
    );
  },
);
