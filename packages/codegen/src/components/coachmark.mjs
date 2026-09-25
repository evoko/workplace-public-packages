/**
 * SOLAR Coachmark, beyond its IR: where MUI draws each layer. Its shells are files of their own,
 * written by hand. One file per component, so adding one edits nothing shared;
 * `src/components/index.mjs` finds them.
 *
 * One step of a guided tour: the card and its connector drawn from Figma's layers by the shared
 * helpers (`src/components/shared/drawn.mjs`), in MUI's Popper beside the element the step is
 * about; the card alone, in place, where it has no anchor.
 */

import { drawnResets } from './shared/drawn.mjs';
import { targetArea } from './shared/target.mjs';

export default {
  name: 'Coachmark',
  mui: {
    // The shell draws every layer itself, each with a class of its own.
    slots: 'drawn',
    resets: drawnResets('Coachmark', {
      '& .SolarCoachmark-title, & .SolarCoachmark-body, & .SolarCoachmark-counter':
        { whiteSpace: 'normal' },
      // The close button is a <button> with none of the browser's own look, its icon filling it,
      // and a 44 × 44 target around it (shared/target.mjs).
      '& .SolarCoachmark--close > svg': {
        display: 'block',
        width: '100%',
        height: '100%',
      },
      ...targetArea('& button.SolarCoachmark--close'),
      '& button.SolarCoachmark--close': {
        appearance: 'none',
        border: '0',
        padding: '0',
        margin: '0',
        background: 'none',
        cursor: 'pointer',
      },
      // The connector is decorative, and takes no pointer from what it points at.
      '& .SolarCoachmark--connector': { pointerEvents: 'none' },
    }),
  },
  flutter: {},
};
