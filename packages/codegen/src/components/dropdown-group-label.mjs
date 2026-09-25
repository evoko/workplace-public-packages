/**
 * SOLAR Dropdown Group Label, beyond its IR: where MUI draws each layer. Its shells are files of
 * their own, written by hand. One file per component, so adding one edits nothing shared;
 * `src/components/index.mjs` finds them.
 *
 * A drawn component (`src/components/shared/drawn.mjs`): a section's heading in a Dropdown Menu, which takes
 * the menu's size.
 */

import { drawnResets } from './shared/drawn.mjs';

export default {
  name: 'Dropdown Group Label',
  mui: {
    // The shell draws every layer itself, each with a class of its own.
    slots: 'drawn',
    // A block, as a heading spans its menu.
    resets: drawnResets('Dropdown Group Label', { display: 'flex' }),
  },
  flutter: {},
};
