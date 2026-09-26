/**
 * TableFooter's Playground: its breakpoint from its control; each part shown by the toggle of the
 * breakpoint's slot, the shell drawing the one part in whichever the breakpoint draws: how many rows
 * a page shows, an md Dropdown (`rowsPerPage` on desktop, `rowsPerPageMobile` on mobile) whose
 * choice is the `rows` extra, and its words (`rowsPerPageLabel`, desktop only, a cleared one left
 * out); a Pagination of twelve pages (`pagination`, `paginationMobile`) whose page is the `page`
 * extra; the action, an md primary Button in the `button label` words on desktop and an md primary
 * Icon Button on mobile, each press logged. Choosing a count or a page sets it.
 */

import { IconPlus } from '@bwp-web/assets';
import { Button } from '../../src/Button.js';
import { Dropdown } from '../../src/Dropdown.js';
import { DropdownItem } from '../../src/DropdownItem.js';
import { IconButton } from '../../src/IconButton.js';
import { Pagination } from '../../src/Pagination.js';
import { TableFooter, type TableFooterProps } from '../../src/TableFooter.js';
import type { PlaygroundBuilder } from './types.js';

/** The row counts a page offers, the `rows` extra's options. */
const COUNTS = ['10', '25', '50'];

export default {
  render: (p) => {
    const breakpoint =
      p.choice<NonNullable<TableFooterProps['breakpoint']>>('breakpoint');
    const mobile = breakpoint === 'mobile';
    const rows = [p.child('rowsPerPage'), p.child('rowsPerPageMobile')];
    const pages = [p.child('pagination'), p.child('paginationMobile')];
    const button = p.child('button');
    const place = mobile ? 1 : 0;
    return (
      <TableFooter
        breakpoint={breakpoint}
        rowsPerPage={
          rows[place]!.shown ? (
            <Dropdown
              size="md"
              value={p.choice('rows')}
              onChange={(_, chosen) => {
                p.set('rows', chosen);
                p.log('onChange', chosen);
              }}
              inputProps={{ 'aria-label': 'Rows per page' }}
            >
              {COUNTS.map((count) => (
                <DropdownItem key={count} value={count}>
                  {count}
                </DropdownItem>
              ))}
            </Dropdown>
          ) : undefined
        }
        rowsPerPageLabel={p.words('rowsPerPageLabel')}
        pagination={
          pages[place]!.shown ? (
            <Pagination
              count={12}
              page={p.whole('page')}
              onChange={(n) => {
                p.set('page', n);
                p.log('onChange', n);
              }}
            />
          ) : undefined
        }
        button={
          button.shown ? (
            <Button
              size="md"
              prio="primary"
              aria-label={button.text ? undefined : 'Label'}
              onClick={() => p.log('onClick')}
            >
              {button.text || undefined}
            </Button>
          ) : undefined
        }
        iconButton={
          p.child('iconButton').shown ? (
            <IconButton
              size="md"
              shape="square"
              prio="primary"
              icon={<IconPlus />}
              aria-label="Add"
              onClick={() => p.log('onClick')}
            />
          ) : undefined
        }
      />
    );
  },
} satisfies PlaygroundBuilder;
