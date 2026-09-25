/**
 * SOLAR Container, beyond its IR: where MUI draws each layer. Its shells are files of their own,
 * written by hand. One file per component, so adding one edits nothing shared;
 * `src/components/index.mjs` finds them.
 *
 * A drawn region (`src/components/shared/drawn.mjs`): the caller's content in Figma's content slot, padded,
 * and outlined or not.
 */

import { drawnResets } from './shared/drawn.mjs';

export default {
  name: 'Container',
  mui: {
    // The shell draws every layer itself, each with a class of its own; a block, as a region is.
    slots: 'drawn',
    resets: drawnResets('Container', {
      display: 'flex',
      '& .SolarContainer-content': { display: 'flex' },
    }),
  },
  flutter: {},
};
