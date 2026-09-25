/**
 * SOLAR GlobalSearch, beyond its IR: where MUI draws each layer and marks each state. Its shells
 * are files of their own, written by hand. One file per component, so adding one edits nothing
 * shared; `src/components/index.mjs` finds them.
 *
 * A trigger drawn as a field (owner decision 2026-09-24): a button that shows the placeholder or
 * the current query, SOLAR's search icon before it and a Kbd of its shortcut after, and opens the
 * app's search. Filled follows the query (the overlay's `derive`).
 */

import { drawnResets } from './shared/drawn.mjs';
import { targetArea } from './shared/target.mjs';

const P = 'SolarGlobalSearch';

export default {
  name: 'GlobalSearch',
  mui: {
    // The shell draws every layer itself, each with a class of its own; its root is a button.
    slots: 'drawn',
    resets: drawnResets('GlobalSearch', {
      cursor: 'pointer',
      // A button's own font and alignment give way to the recipe's.
      font: 'inherit',
      textAlign: 'start',
      '&:focus-visible': { outline: 'none' },
      // The words take the room the icon and the Kbd leave, cut short where they run out.
      [`& .${P}--searchWorkplace`]: {
        flex: '1 1 0%',
        minWidth: '0',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
      },
      // A 44 × 44 target around it (shared/target.mjs).
      ...targetArea(),
    }),
    states: {
      default: null,
      hover: '&:hover',
      focus: '&:focus-visible',
      filled: `&.${P}-filled`,
      error: `&.${P}-error`,
    },
    overlaps: { focus: ['hover'] },
  },
  flutter: {},
};
