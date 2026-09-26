// RowSelect's Playground: a select cell is drawn as the first cell of its Row, in a Table, beside a
// sample cell: in the header row where `header` is on (selecting every row), else a device's row.
// Whether its row is selected is the row's, the `selected` extra; the header's partial selection
// the `mixed` extra. A tap selects or clears it, which `selected` follows, and clears `mixed`. As
// the web's (stories/playground/row-select.tsx).

import 'package:solar_flutter/solar_flutter.dart';

import 'playground.dart';
import 'samples.dart';

final rowSelectPlayground = SolarPlaygroundBuilder(
  build: (p) {
    final header = p.flag('header');
    final mixed = p.flag('mixed');
    final row = SolarRow(
      type: header ? SolarRowType.title : SolarRowType.nonExpandable,
      cells: [
        SolarRowSelect(
          header: header,
          checked: p.flag('selected'),
          mixed: mixed,
          onChanged: (on) {
            p.set('selected', on);
            if (mixed) p.set('mixed', false);
            p.log('onChanged', on);
          },
        ),
        SolarColumnItem(
          header: header,
          label: header ? sampleColumns.first : sampleDevices.first.$1,
        ),
      ],
    );
    return header ? SolarTable(header: row) : SolarTable(rows: [row]);
  },
);
