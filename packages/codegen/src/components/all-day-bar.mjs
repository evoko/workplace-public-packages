/**
 * SOLAR All-Day Bar, beyond its IR: where MUI draws each layer. Its shells are files of their own,
 * written by hand. One file per component, so adding one edits nothing shared;
 * `src/components/index.mjs` finds them.
 *
 * An event that spans a day or more, in a grid's all-day row: its stripe or fill, its time and its
 * title, drawn from Figma's layers by the shared helpers (`src/components/shared/drawn.mjs`).
 */

import { drawnResets } from './shared/drawn.mjs';

export default {
  name: 'All-Day Bar',
  mui: {
    // The shell draws every layer itself, each with a class of its own.
    slots: 'drawn',
    // Its title runs out at the bar's end, on one line, as an Event Chip's does.
    resets: drawnResets('AllDayBar', {
      // Its stripe and time keep their size beside a long title, as Figma's fixed layers do.
      '& .SolarAllDayBar--stripe, & .SolarAllDayBar-time': {
        flexShrink: 0,
        whiteSpace: 'nowrap',
      },
      '& .SolarAllDayBar-title': {
        minWidth: 0,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
      },
    }),
  },
  flutter: {},
};
