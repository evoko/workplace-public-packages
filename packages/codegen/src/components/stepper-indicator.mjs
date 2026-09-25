/**
 * SOLAR Stepper Indicator, beyond its IR: where MUI draws each layer. Its shells are files of their
 * own, written by hand. One file per component, so adding one edits nothing shared;
 * `src/components/index.mjs` finds them.
 *
 * A drawn component (`src/components/shared/drawn.mjs`): the circle of one step's status, a part of a Step.
 */

import { drawnResets } from './shared/drawn.mjs';

export default {
  name: 'Stepper Indicator',
  mui: {
    // The shell draws every layer itself, each with a class of its own.
    slots: 'drawn',
    resets: drawnResets('Stepper Indicator', {
      display: 'flex',
      borderStyle: 'solid',
    }),
  },
  flutter: {},
};
