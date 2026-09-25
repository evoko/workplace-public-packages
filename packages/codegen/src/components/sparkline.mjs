/**
 * SOLAR Sparkline, beyond its IR: where MUI draws each layer. Its shells are files of their own,
 * written by hand. One file per component, so adding one edits nothing shared;
 * `src/components/index.mjs` finds them.
 *
 * A tiny trend line, drawn from Figma's layers by the shared helpers
 * (`src/components/shared/drawn.mjs`): Figma's sample line where it has no data, the caller's data
 * scaled into the line's box where it has.
 */

import { drawnResets } from './shared/drawn.mjs';

export default {
  name: 'Sparkline',
  mui: {
    // The shell draws every layer itself, each with a class of its own.
    slots: 'drawn',
    resets: drawnResets('Sparkline', {}),
  },
  flutter: {},
};
