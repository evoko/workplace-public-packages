import oracle from '../../../../../spec/verify/tablefooter.json';
import { Button } from '../../../src/Button.js';
import { Dropdown } from '../../../src/Dropdown.js';
import { DropdownItem } from '../../../src/DropdownItem.js';
import { IconButton } from '../../../src/IconButton.js';
import { Pagination } from '../../../src/Pagination.js';
import {
  TableFooter,
  type TableFooterProps,
} from '../../../src/TableFooter.js';
import { icon } from './probes.js';
import type { VisualCase } from './types.js';

// Each breakpoint with what Figma draws in it: the bare md Dropdown (a page of 10 rows) and its
// words, Pagination's first of twelve pages, and the md primary action, a Button on desktop and
// an Icon Button on mobile.
export default {
  oracle,
  render: (v) => (
    <TableFooter
      {...(v.props as Pick<TableFooterProps, 'breakpoint'>)}
      style={{
        width:
          (v.props as { breakpoint?: string }).breakpoint === 'mobile'
            ? 377
            : 1020,
      }}
      rowsPerPage={
        <Dropdown size="md" value="10" onChange={() => {}} aria-label="Rows">
          <DropdownItem value="10">10</DropdownItem>
          <DropdownItem value="25">25</DropdownItem>
        </Dropdown>
      }
      rowsPerPageLabel="rows per page"
      pagination={<Pagination count={12} page={1} onChange={() => {}} />}
      button={
        <Button size="md" prio="primary">
          Button
        </Button>
      }
      iconButton={
        <IconButton icon={icon} aria-label="Action" size="md" prio="primary" />
      }
    />
  ),
} satisfies VisualCase;
