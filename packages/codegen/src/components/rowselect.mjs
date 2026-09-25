/**
 * SOLAR RowSelect, beyond its IR: where MUI draws each layer. Its shells are files of their own,
 * written by hand. One file per component, so adding one edits nothing shared;
 * `src/components/index.mjs` finds them.
 *
 * A Table row's select cell: a SOLAR Checkbox centred in its square, drawn from Figma's layer tree
 * by the shared helpers (`src/components/shared/drawn.mjs`).
 */

import { drawnResets } from './shared/drawn.mjs';

export default {
  name: 'RowSelect',
  mui: {
    // The shell draws every layer itself, each with a class of its own.
    slots: 'drawn',
    // A cell of its row, its square its own.
    resets: drawnResets('RowSelect', { display: 'flex' }),
  },
  flutter: {},
};
