/**
 * Dropdown Group Label's Playground: a heading works only in its menu, so it is drawn in a Dropdown
 * Menu of its size, in place, over two sample rows, whose clicks are logged. Its words the `label`
 * extra.
 */

import {
  DropdownGroupLabel,
  type DropdownGroupLabelProps,
} from '../../src/DropdownGroupLabel.js';
import { DropdownItem } from '../../src/DropdownItem.js';
import { DropdownMenu } from '../../src/DropdownMenu.js';
import type { PlaygroundBuilder } from './types.js';

/** The rows under the heading. */
const ROWS = ['Option 1', 'Option 2'];

export default {
  render: (p) => {
    const size = p.choice<NonNullable<DropdownGroupLabelProps['size']>>('size');
    return (
      <DropdownMenu size={size}>
        <DropdownGroupLabel size={size}>{p.text('label')}</DropdownGroupLabel>
        {ROWS.map((row) => (
          <DropdownItem key={row} onClick={() => p.log('onClick', row)}>
            {row}
          </DropdownItem>
        ))}
      </DropdownMenu>
    );
  },
} satisfies PlaygroundBuilder;
