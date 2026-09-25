/**
 * SOLAR Chart Tooltip, beyond its IR: where MUI draws each layer. Its shells are files of their
 * own, written by hand. One file per component, so adding one edits nothing shared;
 * `src/components/index.mjs` finds them.
 *
 * A chart's value on hover, drawn from Figma's layers by the shared helpers
 * (`src/components/shared/drawn.mjs`): the point's title and a row per series, each its dot, name
 * and value.
 */

import { drawnResets } from './shared/drawn.mjs';

export default {
  name: 'Chart Tooltip',
  mui: {
    // The shell draws every layer itself, each with a class of its own.
    slots: 'drawn',
    resets: drawnResets('Chart Tooltip', {}),
  },
  flutter: {},
  // Each row's series name and value: the rows the caller gives, on both platforms.
  api: {
    react: { label: 'rows', value: 'rows' },
    flutter: { label: 'rows', value: 'rows' },
  },
};
