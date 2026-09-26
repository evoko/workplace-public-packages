/**
 * Popover's Playground: an "Open" button opens it beside itself, its tip pointing at it, as an
 * app's trigger would, and the `open` extra follows it (overlay.tsx); Escape or a click outside it
 * closes it (`onClose`). Its size and placement from their controls; its title and words the
 * `title` and `body` extras (the IR holds no text slot), a cleared body left out.
 */

import { useState } from 'react';
import { Popover, type PopoverProps } from '../../src/Popover.js';
import { overlayOf } from './overlay.js';
import type { Playground, PlaygroundBuilder } from './types.js';

function PopoverPlayground({ p }: { p: Playground }) {
  const overlay = overlayOf(p);
  // The trigger's element, which its tip points at.
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  return (
    <>
      <span ref={setAnchor} style={{ display: 'inline-block' }}>
        {overlay.trigger}
      </span>
      <Popover
        anchorEl={anchor}
        open={overlay.open}
        onClose={() => overlay.close()}
        placement={p.choice<NonNullable<PopoverProps['placement']>>(
          'placement',
        )}
        size={p.choice<NonNullable<PopoverProps['size']>>('size')}
        title={p.text('title')}
        body={p.words('body')}
      />
    </>
  );
}

export default {
  render: (p) => <PopoverPlayground p={p} />,
} satisfies PlaygroundBuilder;
