/**
 * SOLAR Weekday Header, beyond its IR: where MUI draws each layer. Its shells are files of their own,
 * written by hand. One file per component, so adding one edits nothing shared;
 * `src/components/index.mjs` finds them.
 *
 * A calendar grid's column header: its weekday, today's tinted, drawn from Figma's layers by the
 * shared helpers (`src/components/shared/drawn.mjs`).
 */

import { drawnResets } from './shared/drawn.mjs';

export default {
  name: 'Weekday Header',
  mui: {
    // The shell draws every layer itself, each with a class of its own.
    slots: 'drawn',
    resets: drawnResets('Weekday Header', {}),
  },
  flutter: {},
};
