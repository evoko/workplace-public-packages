/**
 * Context Menu's Playground: an "Open" button opens it at itself, as an app opens it at the object
 * it acts on, and the `open` extra follows it (overlay.tsx); Escape, a click outside, Tab or
 * choosing an action closes it. Its content, sample actions with their shortcuts (the last,
 * Delete, destructive, after a Divider), shown by the `content` toggle (off, the menu is empty).
 * Choosing an action is logged with its words.
 */

import { useState } from 'react';
import { ContextMenu } from '../../src/ContextMenu.js';
import { ContextMenuItem } from '../../src/ContextMenuItem.js';
import { Divider } from '../../src/Divider.js';
import { overlayOf } from './overlay.js';
import { actions } from './samples.js';
import type { Playground, PlaygroundBuilder } from './types.js';

function Menu({ p }: { p: Playground }) {
  const overlay = overlayOf(p);
  // The trigger's element, which the menu floats at.
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const item = (label: string, shortcut?: string, destructive = false) => (
    <ContextMenuItem
      key={label}
      shortcut={shortcut}
      destructive={destructive}
      onClick={() => overlay.close('onClick', label)}
    >
      {label}
    </ContextMenuItem>
  );
  return (
    <>
      <span ref={setAnchor} style={{ display: 'inline-block' }}>
        {overlay.trigger}
      </span>
      <ContextMenu
        anchorEl={anchor}
        open={overlay.open}
        onClose={() => overlay.close()}
      >
        {p.flag('content')
          ? [
              ...actions.map(([label, shortcut]) => item(label, shortcut)),
              <Divider key="divider" component="li" />,
              item('Delete', undefined, true),
            ]
          : null}
      </ContextMenu>
    </>
  );
}

export default {
  render: (p) => <Menu p={p} />,
} satisfies PlaygroundBuilder;
