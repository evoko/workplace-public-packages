/**
 * Table's Playground: its breakpoint, and whether its rows draw their select and expand cells, from
 * their controls; its header, a Row of type title over the sample columns, shown by the `header`
 * toggle; its rows, three sample devices, shown by the `rows` toggle. Live as an app's table: a
 * row's select cell selects it and the header's selects every row (mixed where some are), which
 * the `selected` extra follows, the selected rows' names comma-separated; expandable, the first
 * device is a group's top row, its expand button showing the other two (middle and bottom), which
 * `expanded` follows. A row's press is logged with its name.
 */

import { Row, type RowProps } from '../../src/Row.js';
import { Table, type TableProps } from '../../src/Table.js';
import { devices } from './samples.js';
import { deviceCells, headerCells, namedIn } from './tables.js';
import type { PlaygroundBuilder } from './types.js';

const names = devices.map(([name]) => name);

export default {
  render: (p) => {
    const expandable = p.flag('expandable');
    const selected = namedIn(p.text('selected'));
    const expanded = p.flag('expanded');
    const all = names.every((n) => selected.has(n));
    const some = names.some((n) => selected.has(n));
    const select = (name: string, on: boolean) => {
      const next = names.filter((n) => (n === name ? on : selected.has(n)));
      p.set('selected', next.join(', '));
      p.log('onSelectedChange', { [name]: on });
    };
    // Expandable, the first device heads a group of the other two.
    const typeOf = (i: number): NonNullable<RowProps['type']> =>
      !expandable
        ? 'non-expandable'
        : i === 0
          ? 'top'
          : i === devices.length - 1
            ? 'bottom'
            : 'middle';
    return (
      <Table
        breakpoint={p.choice<NonNullable<TableProps['breakpoint']>>(
          'breakpoint',
        )}
        expandable={expandable}
        selectable={p.flag('selectable')}
        header={
          p.child('header').shown ? (
            <Row
              type="title"
              selected={all}
              mixed={some && !all}
              onSelectedChange={(on) => {
                p.set('selected', on ? names.join(', ') : '');
                p.log('onSelectedChange', on);
              }}
            >
              {headerCells()}
            </Row>
          ) : undefined
        }
      >
        {p.flag('rows')
          ? devices
              .filter((_, i) => !expandable || i === 0 || expanded)
              .map((device, i) => (
                <Row
                  key={device[0]}
                  type={typeOf(i)}
                  selected={selected.has(device[0])}
                  selectLabel={`Select ${device[0]}`}
                  onSelectedChange={(on) => select(device[0], on)}
                  expanded={expanded}
                  onExpandedChange={(next) => {
                    p.set('expanded', next);
                    p.log('onExpandedChange', next);
                  }}
                  onClick={() => p.log('onClick', device[0])}
                >
                  {deviceCells(device)}
                </Row>
              ))
          : null}
      </Table>
    );
  },
} satisfies PlaygroundBuilder;
