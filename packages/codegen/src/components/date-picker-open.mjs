/**
 * SOLAR Date Picker Open, beyond its IR: where MUI draws each layer. Its shells are files of their
 * own, written by hand. One file per component, so adding one edits nothing shared;
 * `src/components/index.mjs` finds them.
 *
 * A drawn calendar (`src/components/shared/drawn.mjs`): a month's header, its weekdays and a grid of Date
 * Picker Day Cells, as many weeks as the month spans, the arrow keys moving the focus in it, one
 * date chosen. Its dates are the platform's (`internal/calendar.ts`; DateTime and
 * MaterialLocalizations), not a picker library's.
 */

import { drawnResets } from './shared/drawn.mjs';
import { targetArea } from './shared/target.mjs';

const P = 'SolarDatePickerOpen';

/** Each calendar the component draws: a single one, or a double's two, by their layers. */
const MONTHS = [
  {
    offset: 0,
    header: 'monthHeader',
    label: 'month',
    previous: 'monthHeaderIconArrowLeft',
    next: 'monthHeaderIconArrowRight',
    weekdays: 'weekdayRowWeekday',
    grid: 'dayGrid',
  },
  {
    offset: 0,
    header: 'containerMonthHeader',
    label: 'containerMonthHeaderMonthLabel',
    previous: 'containerMonthHeaderIconArrowLeft',
    weekdays: 'containerWeekdayRowWeekday',
    grid: 'containerDayGrid',
  },
  {
    offset: 1,
    header: 'container2MonthHeader',
    label: 'container2MonthHeaderMonthLabel',
    next: 'container2MonthHeaderIconArrowRight',
    weekdays: 'container2WeekdayRowWeekday',
    grid: 'container2DayGrid',
  },
];

export default {
  name: 'Date Picker Open',
  mui: {
    // The shell draws every layer itself, each with a class of its own; its grids hold its days.
    slots: 'drawn',
    // A block; each grid seven days wide, the weeks the month spans; the arrows are buttons with a
    // 44 × 44 target, none of the browser's own look.
    resets: drawnResets('Date Picker Open', {
      display: 'flex',
      [MONTHS.map((m) => `& .${P}-${m.grid}`).join(', ')]: {
        gridTemplateColumns: 'repeat(7, max-content)',
      },
      // The target's own rule on the button, merged: one rule per selector.
      ...targetArea(`& .${P}-arrow`),
      [`& .${P}-arrow`]: {
        ...targetArea(`& .${P}-arrow`)[`& .${P}-arrow`],
        appearance: 'none',
        border: '0',
        padding: '0',
        margin: '0',
        background: 'none',
        color: 'inherit',
        cursor: 'pointer',
        minWidth: '0',
        // Its icon's size beside the month's name, which fills the header.
        flexShrink: '0',
        '& > svg': { display: 'block', width: '100%', height: '100%' },
      },
    }),
  },
  flutter: {},
  // How each platform reaches what the IR names, where not by its own name (src/shells/api.mjs).
  // The month is the one shown, which the shell writes itself.
  api: {
    react: { month: null },
    flutter: { month: null },
  },
};
