/**
 * SOLAR Split Dropdown, beyond its IR: where MUI draws each layer. Its shells are files of their
 * own, written by hand. One file per component, so adding one edits nothing shared;
 * `src/components/index.mjs` finds them.
 *
 * A drawn box (`src/components/shared/drawn.mjs`) of two zones, each the caller's: a plain top and a tinted
 * strip under it, cut to the box's rounded corners.
 */

import { drawnResets } from './shared/drawn.mjs';

export default {
  name: 'Split Dropdown',
  mui: {
    // The shell draws every layer itself, each with a class of its own; a block cut to its
    // rounded corners, as the tinted zones inside it are.
    slots: 'drawn',
    resets: drawnResets('Split Dropdown', {
      display: 'flex',
      overflow: 'hidden',
      '& .SolarSplitDropdown-box': { display: 'flex' },
    }),
  },
  flutter: {},
  // How each platform reaches what the IR names, where not by its own name (src/shells/api.mjs).
  api: {
    react: { topContent: 'top', lowerContent: 'lower' },
    flutter: { topContent: 'top', lowerContent: 'lower' },
  },
};
