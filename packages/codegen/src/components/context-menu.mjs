/**
 * SOLAR Context Menu, beyond its IR: where MUI draws each layer. Its shells are files of their own,
 * written by hand. One file per component, so adding one edits nothing shared;
 * `src/components/index.mjs` finds them.
 *
 * A drawn surface, as Dropdown Menu is (`src/components/shared/menu.mjs`): its content layer holds the
 * caller's rows and dividers, and it floats at a point, the pointer's, where it is anchored.
 */

import { drawnResets } from './shared/drawn.mjs';
import { menuResets } from './shared/menu.mjs';

export default {
  name: 'Context Menu',
  mui: {
    // The shell draws every layer itself, each with a class of its own; its content is the list.
    slots: 'drawn',
    resets: drawnResets('Context Menu', {
      flexDirection: 'column',
      ...menuResets('Context Menu'),
    }),
  },
  flutter: {},
};
