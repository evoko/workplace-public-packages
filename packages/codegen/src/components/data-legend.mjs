/**
 * SOLAR Data Legend, beyond its IR: where MUI draws each layer. Its shells are files of their own,
 * written by hand. One file per component, so adding one edits nothing shared;
 * `src/components/index.mjs` finds them.
 *
 * A chart's legend, drawn from Figma's layers by the shared helpers
 * (`src/components/shared/drawn.mjs`): a dot in each series' colour beside its name, in a row or a
 * column, one item per series the caller gives.
 */

import { drawnResets } from './shared/drawn.mjs';

export default {
  name: 'Data Legend',
  mui: {
    // The shell draws every layer itself, each with a class of its own.
    slots: 'drawn',
    resets: drawnResets('Data Legend', {}),
  },
  flutter: {},
  // Each item's name, one per series: the items the caller gives, on both platforms.
  api: {
    react: { label: 'items' },
    flutter: { label: 'items' },
  },
};
