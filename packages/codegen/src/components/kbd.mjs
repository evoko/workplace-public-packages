/**
 * SOLAR Kbd, beyond its IR: where MUI draws each layer. Its shells are files of their own, written
 * by hand. One file per component, so adding one edits nothing shared; `src/components/index.mjs`
 * finds them.
 *
 * A drawn component: the shells draw its layer tree with the shared helpers
 * (`src/components/shared/drawn.mjs`), the label as the caller's text in its box.
 */

import { drawnResets } from './shared/drawn.mjs';

export default {
  name: 'Kbd',
  mui: {
    // The shell draws every layer itself, each with a class of its own.
    slots: 'drawn',
    // <kbd> is monospaced in a browser's own style sheet; the recipe's text style is the label's.
    resets: drawnResets('Kbd', { fontFamily: 'inherit' }),
  },
  flutter: {},
};
