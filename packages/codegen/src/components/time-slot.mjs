/**
 * SOLAR Time Slot, beyond its IR: where MUI draws each layer and marks each state. Its shells are
 * files of their own, written by hand. One file per component, so adding one edits nothing shared;
 * `src/components/index.mjs` finds them.
 *
 * An empty cell of a week or day grid, its half-hour rule placed where Figma puts it, drawn from
 * Figma's layers by the shared helpers (`src/components/shared/drawn.mjs`): hovered as a pointer
 * reaches it, selected by the shell's class.
 */

import { drawnResets } from './shared/drawn.mjs';

const P = 'SolarTimeSlot';

export default {
  name: 'Time Slot',
  mui: {
    // The shell draws every layer itself, each with a class of its own.
    slots: 'drawn',
    resets: drawnResets('Time Slot', { cursor: 'pointer', outline: 'none' }),
    // Hovered as a pointer reaches it; selected by the shell's class, over the hover.
    states: {
      default: null,
      hover: '&:hover',
      selected: `&.${P}-selected`,
    },
  },
  flutter: {},
};
