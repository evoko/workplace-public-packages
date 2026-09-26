/**
 * Row's Playground: a row is drawn in its Table, which says whether it draws its select cell and
 * its expand cell (the `checkBox` and `expand` toggles); a title row is the table's header, any
 * other sits under a sample header row. Its cells, the sample columns' names or a sample device's
 * words, shown by `titleRowContent`. Live as a table's row: its select cell selects it (the sample
 * header's too, standing for the one row), which `selected` follows; a top row's expand button
 * shows its group, which the `expanded` extra follows; its press is logged.
 */

import { Row, type RowProps } from '../../src/Row.js';
import { Table } from '../../src/Table.js';
import { devices } from './samples.js';
import { deviceCells, headerCells } from './tables.js';
import type { PlaygroundBuilder } from './types.js';

export default {
  render: (p) => {
    const type = p.choice<NonNullable<RowProps['type']>>('type');
    const selected = p.flag('selected');
    const content = p.flag('titleRowContent');
    const title = type === 'title';
    const select = (on: boolean) => {
      p.set('selected', on);
      p.log('onSelectedChange', on);
    };
    const row = (
      <Row
        type={type}
        selected={selected}
        onSelectedChange={select}
        expanded={p.flag('expanded')}
        onExpandedChange={(next) => {
          p.set('expanded', next);
          p.log('onExpandedChange', next);
        }}
        onClick={title ? undefined : () => p.log('onClick')}
      >
        {content ? (title ? headerCells() : deviceCells(devices[0]!)) : null}
      </Row>
    );
    return (
      <Table
        selectable={p.child('checkBox').shown}
        expandable={p.child('expand').shown}
        header={
          title ? (
            row
          ) : (
            <Row type="title" selected={selected} onSelectedChange={select}>
              {headerCells()}
            </Row>
          )
        }
      >
        {title ? null : row}
      </Table>
    );
  },
} satisfies PlaygroundBuilder;
