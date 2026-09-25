/**
 * SOLAR Tree Indent (Figma's `.Tree Indent`), beyond its IR: where MUI draws each layer. Its shells
 * are files of their own, written by hand. One file per component, so adding one edits nothing
 * shared; `src/components/index.mjs` finds them.
 *
 * A drawing (its overlay's `drawing`): each depth is a row of that many 16px units, drawn from
 * Figma's layer tree by the shared helpers (`src/components/shared/drawn.mjs`).
 */

import { drawnResets } from './shared/drawn.mjs';

export default {
  name: 'Tree Indent',
  address: '.Tree Indent',
  mui: {
    // The shell draws every layer itself, each with a class of its own.
    slots: 'drawn',
    resets: drawnResets('Tree Indent'),
  },
  flutter: {},
};
