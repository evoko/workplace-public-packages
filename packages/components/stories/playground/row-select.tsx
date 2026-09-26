/**
 * RowSelect's Playground: a select cell is drawn as the first cell of its Row, in a Table, beside a
 * sample cell: in the header row where `header` is on (selecting every row), else a device's row.
 * Whether its row is selected is the row's, the `selected` extra; the header's partial selection
 * the `mixed` extra. A click selects or clears it, which `selected` follows, and clears `mixed`.
 */

import { ColumnItem } from '../../src/ColumnItem.js';
import { Row } from '../../src/Row.js';
import { RowSelect } from '../../src/RowSelect.js';
import { Table } from '../../src/Table.js';
import { columns, devices } from './samples.js';
import type { PlaygroundBuilder } from './types.js';

export default {
  render: (p) => {
    const header = p.flag('header');
    const mixed = p.flag('mixed');
    const row = (
      <Row type={header ? 'title' : 'non-expandable'}>
        <RowSelect
          header={header}
          checked={p.flag('selected')}
          mixed={mixed}
          onChange={(_, on) => {
            p.set('selected', on);
            if (mixed) p.set('mixed', false);
            p.log('onChange', on);
          }}
        />
        <ColumnItem header={header}>
          {header ? columns[0] : devices[0]![0]}
        </ColumnItem>
      </Row>
    );
    return header ? <Table header={row} /> : <Table>{row}</Table>;
  },
} satisfies PlaygroundBuilder;
