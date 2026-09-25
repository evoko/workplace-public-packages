/**
 * SOLAR Timestamp, beyond its IR: where MUI draws each layer. Its shells are files of their own,
 * written by hand. One file per component, so adding one edits nothing shared;
 * `src/components/index.mjs` finds them.
 *
 * A drawn component: one text, the words the app formats (owner decision, 2026-09-24), drawn by
 * the shared layer helpers (`src/components/shared/drawn.mjs`). `format` changes the words, not the look.
 */

import { drawnResets } from './shared/drawn.mjs';

export default {
  name: 'Timestamp',
  mui: {
    // The shell draws every layer itself, each with a class of its own.
    slots: 'drawn',
    resets: drawnResets('Timestamp'),
  },
  flutter: {},
};
