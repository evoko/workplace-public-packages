/**
 * SOLAR Event Chip, beyond its IR: where MUI draws each layer. Its shells are files of their own,
 * written by hand. One file per component, so adding one edits nothing shared;
 * `src/components/index.mjs` finds them.
 *
 * One event in a calendar: its category's stripe or fill, its time and its title, drawn from
 * Figma's layers by the shared helpers (`src/components/shared/drawn.mjs`).
 */

import { drawnResets } from './shared/drawn.mjs';

export default {
  name: 'Event Chip',
  mui: {
    // The shell draws every layer itself, each with a class of its own.
    slots: 'drawn',
    // Its title runs out at the chip's end, on one line, as a calendar's chips do.
    resets: drawnResets('EventChip', {
      // Its stripe and time keep their size beside a long title, as Figma's fixed layers do.
      '& .SolarEventChip--stripe, & .SolarEventChip-time': {
        flexShrink: 0,
        whiteSpace: 'nowrap',
      },
      '& .SolarEventChip-title': {
        minWidth: 0,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
      },
    }),
  },
  flutter: {},
};
