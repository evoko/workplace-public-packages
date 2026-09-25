/**
 * SOLAR DragHandle, beyond its IR: where MUI draws each layer and marks each state. Its shells are
 * files of their own, written by hand. One file per component, so adding one edits nothing shared;
 * `src/components/index.mjs` finds them.
 *
 * A drawn component (`src/components/shared/drawn.mjs`): six dots, focusable, pressed while held (the grab).
 * The drag itself is the caller's.
 */

import { drawnResets } from './shared/drawn.mjs';
import { targetArea } from './shared/target.mjs';

export default {
  name: 'DragHandle',
  mui: {
    // The shell draws every layer itself, each with a class of its own.
    slots: 'drawn',
    // A grip says it can be picked up, and is held while it is; SOLAR's focus ring stands for the
    // browser's outline.
    resets: drawnResets('DragHandle', {
      cursor: 'grab',
      '&:active': { cursor: 'grabbing' },
      '&.SolarDragHandle-disabled': { cursor: 'default' },
      '&:focus-visible': { outline: 'none' },
      // A 44 × 44 target around the grip (shared/target.mjs).
      ...targetArea(),
    }),
    // Pressed while held by the pointer, or while the caller's drag says it is lifted.
    states: {
      default: null,
      hover: '&:hover',
      pressed: '&:active, &[aria-pressed="true"]',
      focus: '&:focus-visible',
      disabled: '&.SolarDragHandle-disabled',
    },
    overlaps: { pressed: ['hover'], focus: ['hover', 'pressed'] },
  },
  flutter: {},
};
