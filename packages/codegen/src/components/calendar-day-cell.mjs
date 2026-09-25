/**
 * SOLAR Calendar Day Cell, beyond its IR: where MUI draws each layer and marks each state. Its
 * shells are files of their own, written by hand. One file per component, so adding one edits
 * nothing shared; `src/components/index.mjs` finds them.
 *
 * A drawn component (`src/components/shared/drawn.mjs`): one day of a calendar's month grid, its
 * date and the caller's Event Chips, today, selected, in today's column or of another month by the
 * shell's classes.
 */

import { drawnResets } from './shared/drawn.mjs';

const P = 'SolarCalendarDayCell';

export default {
  name: 'Calendar Day Cell',
  address: 'calendar/Day Cell',
  mui: {
    // The shell draws every layer itself, each with a class of its own.
    slots: 'drawn',
    // A day's rows are fixed: events past its height are cut off at its edge, as a month grid's
    // are (Figma's three sample chips need 122 of its 120).
    resets: drawnResets('Calendar Day Cell', { overflow: 'hidden' }),
    // Each look by the shell's class. Selected comes after today's column, so a selected day in
    // today's column takes the selected fill; today marks only the date, and another month's day
    // is faded.
    states: {
      default: null,
      todayColumn: `&.${P}-todayColumn`,
      today: `&.${P}-today`,
      selected: `&.${P}-selected`,
      otherMonth: `&.${P}-otherMonth`,
    },
  },
  flutter: {},
};
