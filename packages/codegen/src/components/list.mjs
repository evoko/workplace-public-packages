/**
 * SOLAR List, beyond its IR: where MUI draws each layer. Its shells are files of their own, written
 * by hand. One file per component, so adding one edits nothing shared; `src/components/index.mjs`
 * finds them.
 *
 * A drawn container (`src/components/shared/drawn.mjs`) whose items layer holds the caller's ListItems in place
 * of Figma's examples, a Divider between each two as Figma draws them; its rows take its
 * compactness, as Figma draws them.
 */

import { drawnResets } from './shared/drawn.mjs';

const P = 'SolarList';

export default {
  name: 'List',
  mui: {
    // The shell draws every layer itself, each with a class of its own; its items are a list.
    slots: 'drawn',
    // A block, as a list spans what holds it; its items layer is the <ul>, each row an <li> holding
    // the row and the divider after it, stacked as Figma stacks them.
    resets: drawnResets('List', {
      display: 'flex',
      flexDirection: 'column',
      [`& .${P}-items`]: { margin: '0', padding: '0', listStyle: 'none' },
      [`& .${P}-items > li`]: { display: 'flex', flexDirection: 'column' },
    }),
  },
  flutter: {},
};
