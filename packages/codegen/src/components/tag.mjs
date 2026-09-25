/**
 * SOLAR Tag, beyond its IR: where MUI draws each layer. Its shells are files of their own, written
 * by hand. One file per component, so adding one edits nothing shared; `src/components/index.mjs`
 * finds them.
 *
 * A drawn component (`src/components/shared/drawn.mjs`): a pill whose type follows from what the caller
 * gives (the overlay's derive), its close button a pressable of its own.
 */

import { drawnResets } from './shared/drawn.mjs';
import { targetArea } from './shared/target.mjs';

export default {
  name: 'Tag',
  mui: {
    // The shell draws every layer itself, each with a class of its own.
    slots: 'drawn',
    // A caller's icon fills its slot, which the recipe sizes and colours; the close button is a
    // <button> with none of the browser's own look, its icon filling it.
    resets: drawnResets('Tag', {
      '& .SolarTag-icon > svg, & .SolarTag--iconNone > svg, & .SolarTag--iconClose > svg':
        {
          display: 'block',
          width: '100%',
          height: '100%',
        },
      // A 44 × 44 target around the close button, as far as the page lets it reach
      // (shared/target.mjs).
      ...targetArea('& button.SolarTag--iconClose'),
      '& button.SolarTag--iconClose': {
        appearance: 'none',
        border: '0',
        padding: '0',
        margin: '0',
        background: 'none',
        cursor: 'pointer',
      },
    }),
  },
  flutter: {},
};
