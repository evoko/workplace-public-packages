/**
 * SOLAR StatusIndicator, beyond its IR: where MUI draws each layer. Its shells are files of their
 * own, written by hand. One file per component, so adding one edits nothing shared;
 * `src/components/index.mjs` finds them.
 *
 * A drawing (its overlay's `drawing`): every type is its own shape, from other layers. The shells
 * draw Figma's layer tree with the shared helpers (`src/components/shared/drawn.mjs`), a layer as a glyph
 * where its entry has one and as a box where it does not, placed where the recipe says.
 */

import { drawnResets } from './shared/drawn.mjs';

export default {
  name: 'StatusIndicator',
  mui: {
    // The shell draws every layer itself, each with a class of its own.
    slots: 'drawn',
    resets: drawnResets('StatusIndicator'),
  },
  flutter: {},
};
