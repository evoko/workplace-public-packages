/**
 * Context Menu Item's Playground: an action works only in its menu, so it is drawn in a Context
 * Menu, in place. Its words, shortcut, icons and states from their controls, a cleared shortcut
 * left out. A click is logged; disabled, it is inert.
 */

import { ContextMenu } from '../../src/ContextMenu.js';
import { ContextMenuItem } from '../../src/ContextMenuItem.js';
import type { PlaygroundBuilder } from './types.js';

export default {
  render: (p) => {
    const label = p.text('label');
    return (
      <ContextMenu>
        <ContextMenuItem
          disabled={p.flag('disabled')}
          destructive={p.flag('destructive')}
          leadingIcon={p.icon('leadingIcon')}
          trailingIcon={p.icon('trailingIcon')}
          shortcut={p.words('shortcut')}
          onClick={() => p.log('onClick', label)}
        >
          {label}
        </ContextMenuItem>
      </ContextMenu>
    );
  },
} satisfies PlaygroundBuilder;
