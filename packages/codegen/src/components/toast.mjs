/**
 * SOLAR Toast, beyond its IR: where MUI draws each layer. Its shells are files of their own,
 * written by hand. One file per component, so adding one edits nothing shared;
 * `src/components/index.mjs` finds them.
 *
 * A drawn component (`src/components/shared/drawn.mjs`): a pill holding a SOLAR Tag, restyled by the toast
 * (the overlay's restyles), the message, and an action.
 */

import { drawnResets } from './shared/drawn.mjs';
import { BUTTON_RESET, targetArea } from './shared/target.mjs';

export default {
  name: 'Toast',
  mui: {
    // The shell draws every layer itself, each with a class of its own.
    slots: 'drawn',
    // The action is a bare <button>; the chevron fills its layer.
    resets: drawnResets('Toast', {
      // A 44 × 44 target around the action (shared/target.mjs), none of the browser's look.
      ...targetArea('& button.SolarToast-action', { rules: BUTTON_RESET }),
      '& .SolarToast-chevron > svg': {
        display: 'block',
        width: '100%',
        height: '100%',
      },
    }),
  },
  flutter: {},
};
