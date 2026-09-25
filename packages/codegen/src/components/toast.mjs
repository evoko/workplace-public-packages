/**
 * SOLAR Toast, beyond its IR: where MUI draws each layer. Its shells are files of their own,
 * written by hand. One file per component, so adding one edits nothing shared;
 * `src/components/index.mjs` finds them.
 *
 * A drawn component (`src/components/shared/drawn.mjs`): a pill holding a SOLAR Tag, restyled by the toast
 * (the overlay's restyles), the message, and an action.
 */

import { drawnResets } from './shared/drawn.mjs';
import { targetArea } from './shared/target.mjs';

export default {
  name: 'Toast',
  mui: {
    // The shell draws every layer itself, each with a class of its own.
    slots: 'drawn',
    // The action is a bare <button>; the chevron fills its layer.
    resets: drawnResets('Toast', {
      '& button.SolarToast-action': {
        appearance: 'none',
        border: '0',
        padding: '0',
        margin: '0',
        background: 'none',
        cursor: 'pointer',
      },
      // A 44 × 44 target around the action (shared/target.mjs).
      ...targetArea('& button.SolarToast-action'),
      '& .SolarToast-chevron > svg': {
        display: 'block',
        width: '100%',
        height: '100%',
      },
    }),
  },
  flutter: {},
};
