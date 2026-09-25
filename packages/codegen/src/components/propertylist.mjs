/**
 * SOLAR PropertyList, beyond its IR: where MUI draws each layer. Its shells are files of their own,
 * written by hand. One file per component, so adding one edits nothing shared;
 * `src/components/index.mjs` finds them.
 *
 * The container of an entity's label–value pairs, a <dl> on the web, drawn by the shared layer
 * helpers (`src/components/shared/drawn.mjs`): the caller's PropertyRows, a Divider between each
 * two. Its rows take its in-card look.
 */

import { drawnResets } from './shared/drawn.mjs';

export default {
  name: 'PropertyList',
  mui: {
    // The shell draws every layer itself, each with a class of its own.
    slots: 'drawn',
    // A block that spans what holds it; a <dl> no margin of its own.
    resets: drawnResets('PropertyList', {
      display: 'flex',
      '& .SolarPropertyList-items': { margin: '0' },
    }),
  },
  flutter: {},
};
