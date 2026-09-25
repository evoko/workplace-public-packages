/**
 * SOLAR Section Nav Group Header, beyond its IR: where MUI draws each layer. Its shells are files
 * of their own, written by hand. One file per component, so adding one edits nothing shared;
 * `src/components/index.mjs` finds them.
 *
 * A drawn heading (`src/components/shared/drawn.mjs`) over a group of Section Nav Items, announced as one.
 */

import { drawnResets } from './shared/drawn.mjs';

export default {
  name: 'Section Nav Group Header',
  mui: {
    // The shell draws every layer itself, each with a class of its own.
    slots: 'drawn',
    resets: drawnResets('Section Nav Group Header', { display: 'flex' }),
  },
  flutter: {},
};
