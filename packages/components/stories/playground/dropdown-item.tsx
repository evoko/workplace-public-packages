/**
 * Dropdown Item's Playground: a row works only in its menu, so it is drawn in a Dropdown Menu of
 * its size, in place. Its words the `label` extra, its second line, icon, checkbox and states from
 * their controls, a cleared second line left out. A click chooses it, as a menu's row is chosen:
 * with its checkbox, a choice of several, it flips `selected`; without, it sets it. Disabled, it is
 * inert.
 */

import {
  DropdownItem,
  type DropdownItemProps,
} from '../../src/DropdownItem.js';
import { DropdownMenu } from '../../src/DropdownMenu.js';
import type { PlaygroundBuilder } from './types.js';

export default {
  render: (p) => {
    const size = p.choice<NonNullable<DropdownItemProps['size']>>('size');
    const selected = p.flag('selected');
    const checkbox = p.child('checkbox').shown;
    const label = p.text('label');
    return (
      <DropdownMenu size={size}>
        <DropdownItem
          size={size}
          selected={selected}
          disabled={p.flag('disabled')}
          checkbox={checkbox}
          icon={p.icon('icon')}
          helper={p.words('helper')}
          onClick={() => {
            p.set('selected', checkbox ? !selected : true);
            p.log('onClick', label);
          }}
        >
          {label}
        </DropdownItem>
      </DropdownMenu>
    );
  },
} satisfies PlaygroundBuilder;
