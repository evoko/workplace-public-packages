/**
 * SOLAR Step, beyond its IR: where MUI draws each layer. Its shells are files of their own, written
 * by hand. One file per component, so adding one edits nothing shared; `src/components/index.mjs`
 * finds them.
 *
 * A drawn component (`src/components/shared/drawn.mjs`): one step of a Stepper, its Stepper Indicator in the
 * variant the recipe names for its status, and its label.
 */

import { drawnResets } from './shared/drawn.mjs';
import { targetArea } from './shared/target.mjs';

export default {
  name: 'Step',
  mui: {
    // The shell draws every layer itself, each with a class of its own.
    slots: 'drawn',
    // A step one can go back to is a button, none of the browser's own look, with a 44 × 44 target.
    resets: drawnResets('Step', {
      display: 'flex',
      '&:is(button)': {
        appearance: 'none',
        font: 'inherit',
        margin: '0',
        padding: '0',
        border: '0',
        background: 'none',
        cursor: 'pointer',
        textAlign: 'inherit',
      },
      ...targetArea('&:is(button)'),
    }),
  },
  flutter: {},
};
