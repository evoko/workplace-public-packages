/**
 * SOLAR Bar Stack, beyond its IR: where MUI draws each layer. Its shells are files of their own,
 * written by hand. One file per component, so adding one edits nothing shared;
 * `src/components/index.mjs` finds them.
 *
 * A single bar split into segments, drawn from Figma's layers by the shared helpers
 * (`src/components/shared/drawn.mjs`): the caller's segments, each a SOLAR Bar as long as its
 * share, in a frame with rounded ends.
 */

import { drawnResets } from './shared/drawn.mjs';

export default {
  name: 'Bar Stack',
  mui: {
    // The shell draws every layer itself, each with a class of its own.
    slots: 'drawn',
    // The frame clips its segments to its rounded ends, as Figma's clipping frame does.
    resets: drawnResets('Bar Stack', { overflow: 'hidden' }),
  },
  flutter: {},
};
