/**
 * An overlay's Playground wiring, the same for every overlay (the dialogs, Drawer, Scrim, Tooltip,
 * Popover, Coachmark and the menus): an "Open" button, as an app's trigger would be, that sets the
 * `open` extra (packages/codegen/src/playground/extras.mjs); whether the overlay is open; and
 * `close`, for the overlay's own ways of closing, which clears `open` and logs the callback that
 * closed it.
 */

import { Button } from '../../src/Button.js';
import type { Playground } from './types.js';

export function overlayOf(p: Playground) {
  return {
    /** Whether the overlay is open: the `open` control. */
    open: p.flag('open'),
    /** The trigger that opens it, placed where an app would place its own. */
    trigger: <Button onClick={() => p.set('open', true)}>Open</Button>,
    /** Closes it, from its own callback, and logs that callback (`onClose` unless named). */
    close: (event = 'onClose', detail?: unknown) => {
      p.set('open', false);
      p.log(event, detail);
    },
  };
}
