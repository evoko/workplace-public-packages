import { describe, expect, it } from 'vitest';
import { createElement as h } from 'react';
import { renderToString } from 'react-dom/server';
import { ColumnItem } from '../src/ColumnItem.tsx';
import { PropertyList, usePropertyList } from '../src/PropertyList.tsx';
import { PropertyRow } from '../src/PropertyRow.tsx';
import { Row } from '../src/Row.tsx';
import { RowSelect } from '../src/RowSelect.tsx';
import { Table } from '../src/Table.tsx';
import { TableFooter } from '../src/TableFooter.tsx';
import { TableHeader } from '../src/TableHeader.tsx';

const html = (el) => renderToString(el);
/** Whether an element, not the recipe's CSS, carries the class. */
const drawn = (text, cls) => new RegExp(`class="[^"]*\\b${cls}\\b`).test(text);

/** A row that says its list's in-card look. */
function InCardProbe() {
  return h('span', { 'data-in-card': String(usePropertyList()?.inCard) });
}

const cells = (header) =>
  ['Name', 'Status'].map((words) =>
    h(ColumnItem, { key: words, header }, words),
  );

describe('the SOLAR Table shells', () => {
  it('is a table of rows of cells, the header row of column headers', () => {
    const table = html(
      h(
        Table,
        { header: h(Row, { type: 'title' }, cells(true)) },
        h(Row, null, cells(false)),
      ),
    );
    expect(table).toContain('role="table"');
    expect(table.match(/role="row"/g)).toHaveLength(2);
    expect(table.match(/role="columnheader"/g)).toHaveLength(2);
    expect(table.match(/role="cell"/g)).toHaveLength(2);
  });

  it('takes no role outside a table, where none is valid', () => {
    const row = html(h(Row, null, cells(false)));
    expect(row).not.toContain('role="row"');
    expect(row).not.toContain('role="cell"');
  });

  it('draws each row’s select and expand cells where the table asks', () => {
    const plain = html(h(Table, null, h(Row, null, cells(false))));
    expect(drawn(plain, 'SolarRow-checkBox')).toBe(false);
    expect(drawn(plain, 'SolarRow-expand')).toBe(false);
    const both = html(
      h(
        Table,
        { selectable: true, expandable: true },
        h(Row, null, cells(false)),
      ),
    );
    expect(drawn(both, 'SolarRow-checkBox')).toBe(true);
    expect(drawn(both, 'SolarRow-expand')).toBe(true);
  });

  it('draws the mobile fade on mobile alone', () => {
    expect(drawn(html(h(Table, null)), 'SolarTable--dimming')).toBe(false);
    expect(
      drawn(html(h(Table, { breakpoint: 'mobile' })), 'SolarTable--dimming'),
    ).toBe(true);
  });
});

describe('the SOLAR Row shell', () => {
  it('makes a top row’s expand cell a button that says whether its group shows', () => {
    const top = html(h(Row, { type: 'top', expandable: true }, cells(false)));
    expect(top).toContain('aria-expanded="false"');
    expect(top).toContain('aria-label="Show rows"');
    const open = html(
      h(Row, { type: 'top', expandable: true, expanded: true }, cells(false)),
    );
    expect(open).toContain('aria-expanded="true"');
    expect(open).toContain('aria-label="Hide rows"');
    expect(
      html(h(Row, { type: 'middle', expandable: true }, cells(false))),
    ).not.toContain('aria-expanded');
  });

  it('is pressable, drawing its hover, only where it is given something to do', () => {
    expect(drawn(html(h(Row, null, cells(false))), 'SolarRow-pressable')).toBe(
      false,
    );
    expect(
      drawn(
        html(h(Row, { onClick: () => {} }, cells(false))),
        'SolarRow-pressable',
      ),
    ).toBe(true);
  });

  it('selects every row from the header row, and one row from its own', () => {
    expect(
      html(h(Row, { type: 'title', selectable: true }, cells(true))),
    ).toContain('aria-label="Select all rows"');
    expect(html(h(Row, { selectable: true }, cells(false)))).toContain(
      'aria-label="Select row"',
    );
    expect(html(h(RowSelect, { label: 'Select Dana' }))).toContain(
      'aria-label="Select Dana"',
    );
  });
});

describe('the SOLAR Column Item shell', () => {
  it('takes its type from what it holds', () => {
    const user = html(
      h(ColumnItem, { avatar: h('span', null, 'DS') }, 'Dana Scully'),
    );
    expect(drawn(user, 'SolarColumnItem-avatar')).toBe(true);
    expect(drawn(user, 'SolarColumnItem-name')).toBe(true);
    const status = html(h(ColumnItem, { tag: h('span', null, 'Online') }));
    expect(drawn(status, 'SolarColumnItem-tag')).toBe(true);
    expect(drawn(status, 'SolarColumnItem-avatar')).toBe(false);
  });

  it('makes a header’s words a button where it sorts, saying which way', () => {
    const inRow = (props) =>
      html(
        h(
          Table,
          null,
          h(
            Row,
            { type: 'title' },
            h(ColumnItem, { header: true, ...props }, 'Name'),
          ),
        ),
      );
    const sorts = inRow({ onSort: () => {}, sort: 'ascending' });
    expect(sorts).toContain('SolarColumnItem-sort');
    expect(sorts).toContain('aria-sort="ascending"');
    expect(inRow({ onSort: () => {} })).toContain('aria-sort="none"');
    expect(inRow({})).not.toContain('aria-sort');
  });

  it('sets a numeric column’s words at the end', () => {
    expect(
      drawn(
        html(h(ColumnItem, { numeric: true }, '42')),
        'SolarColumnItem-numeric',
      ),
    ).toBe(true);
  });
});

describe('the SOLAR TableHeader and TableFooter shells', () => {
  it('draws the search on desktop alone, as Figma draws it', () => {
    const search = h('input', { 'aria-label': 'Search' });
    expect(html(h(TableHeader, { search }))).toContain('aria-label="Search"');
    expect(
      html(h(TableHeader, { search, breakpoint: 'mobile' })),
    ).not.toContain('aria-label="Search"');
  });

  it('draws the desktop Button or the mobile Icon Button, and the words on desktop', () => {
    const props = {
      rowsPerPageLabel: 'rows per page',
      button: h('button', null, 'Export'),
      iconButton: h('button', { 'aria-label': 'Export' }),
    };
    const desktop = html(h(TableFooter, props));
    expect(desktop).toContain('>Export</button>');
    expect(desktop).toContain('rows per page');
    const mobile = html(h(TableFooter, { ...props, breakpoint: 'mobile' }));
    expect(mobile).not.toContain('>Export</button>');
    expect(mobile).toContain('aria-label="Export"');
    expect(mobile).not.toContain('rows per page');
  });
});

describe('the SOLAR PropertyList and PropertyRow shells', () => {
  it('is a description list, each row a term and its definition', () => {
    const list = html(
      h(
        PropertyList,
        null,
        h(PropertyRow, { key: 1, tag: h('span', null, 'Online') }, 'Status'),
        h(PropertyRow, { key: 2 }, 'Serial'),
      ),
    );
    expect(list).toContain('<dl');
    expect(list.match(/<dt/g)).toHaveLength(2);
    expect(list.match(/<dd/g)).toHaveLength(1);
    expect(list.match(/role="separator"/g)).toHaveLength(1);
  });

  it('uses no term or definition outside a list, where none is valid', () => {
    expect(html(h(PropertyRow, null, 'Status'))).not.toContain('<dt');
  });

  it('tells its rows its in-card look', () => {
    expect(html(h(PropertyList, { inCard: true }, h(InCardProbe)))).toContain(
      'data-in-card="true"',
    );
    expect(html(h(PropertyList, { inCard: false }, h(InCardProbe)))).toContain(
      'data-in-card="false"',
    );
  });
});
