/**
 * Dropdown Menu's Playground: an "Open" button opens it under itself, as an app's trigger would,
 * and the `open` extra follows it (overlay.tsx); Escape, a click outside, Tab or choosing a row
 * closes it. Its size from its control; its content, a heading over three sample rows, shown by
 * the `content` toggle (off, the menu is empty). Choosing a row is logged with its words.
 */

import { useState } from 'react';
import { DropdownGroupLabel } from '../../src/DropdownGroupLabel.js';
import { DropdownItem } from '../../src/DropdownItem.js';
import {
  DropdownMenu,
  type DropdownMenuProps,
} from '../../src/DropdownMenu.js';
import { overlayOf } from './overlay.js';
import { options } from './samples.js';
import type { Playground, PlaygroundBuilder } from './types.js';

function Menu({ p }: { p: Playground }) {
  const overlay = overlayOf(p);
  // The trigger's element, which the menu floats under.
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  return (
    <>
      <span ref={setAnchor} style={{ display: 'inline-block' }}>
        {overlay.trigger}
      </span>
      <DropdownMenu
        size={p.choice<NonNullable<DropdownMenuProps['size']>>('size')}
        anchorEl={anchor}
        open={overlay.open}
        onClose={() => overlay.close()}
      >
        {p.flag('content')
          ? [
              <DropdownGroupLabel key="heading">
                Group Label
              </DropdownGroupLabel>,
              ...options.map((option) => (
                <DropdownItem
                  key={option}
                  onClick={() => overlay.close('onClick', option)}
                >
                  {option}
                </DropdownItem>
              )),
            ]
          : null}
      </DropdownMenu>
    </>
  );
}

export default {
  render: (p) => <Menu p={p} />,
} satisfies PlaygroundBuilder;
