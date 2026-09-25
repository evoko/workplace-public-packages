/**
 * SOLAR RowExpand, beyond its IR: where MUI draws each layer. Its shells are files of their own,
 * written by hand. One file per component, so adding one edits nothing shared;
 * `src/components/index.mjs` finds them.
 *
 * A drawing (its overlay's `drawing`): a chevron, or a connector drawn beside a child row, drawn
 * from Figma's layer tree by the shared helpers (`src/components/shared/drawn.mjs`), the chevrons as SOLAR
 * icons.
 */

import { drawnResets } from './shared/drawn.mjs';

export default {
  name: 'RowExpand',
  mui: {
    // The shell draws every layer itself, each with a class of its own.
    slots: 'drawn',
    resets: drawnResets('RowExpand', {
      '& .SolarRowExpand-drawnIcon': { display: 'block' },
    }),
  },
  flutter: {},
};
