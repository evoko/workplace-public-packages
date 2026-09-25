/**
 * SOLAR Bar, beyond its IR: where MUI draws each layer. Its shells are files of their own, written
 * by hand. One file per component, so adding one edits nothing shared; `src/components/index.mjs`
 * finds them.
 *
 * One bar of a chart, in one of SOLAR's data colours, drawn from Figma's layers by the shared
 * helpers (`src/components/shared/drawn.mjs`); its box the chart's.
 */

import { drawnResets } from './shared/drawn.mjs';

export default {
  name: 'Bar',
  mui: {
    // The shell draws every layer itself, each with a class of its own.
    slots: 'drawn',
    resets: drawnResets('Bar', {}),
  },
  flutter: {},
};
