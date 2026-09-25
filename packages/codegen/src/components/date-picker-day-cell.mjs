/**
 * SOLAR Date Picker Day Cell, beyond its IR: where MUI draws each layer and marks each state. Its
 * shells are files of their own, written by hand. One file per component, so adding one edits
 * nothing shared; `src/components/index.mjs` finds them.
 *
 * A drawn component (`src/components/shared/drawn.mjs`): one day of Date Picker Open's grid, a grid cell the
 * grid moves the focus to, pressable.
 */

import { drawnResets } from './shared/drawn.mjs';

const P = 'SolarDatePickerDayCell';

export default {
  name: 'Date Picker Day Cell',
  address: 'inputs/Day Cell',
  mui: {
    // The shell draws every layer itself, each with a class of its own.
    slots: 'drawn',
    resets: drawnResets('Date Picker Day Cell', {
      cursor: 'pointer',
      outline: 'none',
      [`&.${P}-disabled`]: { cursor: 'default' },
    }),
    // Hovered and focused as a user reaches it; today, selected and the rest by the shell's
    // classes. Selected comes after today, so a selected today takes the selected ink on its fill,
    // and keeps today's edge, as the description says ("today wins for the marker, selected wins
    // for the fill"); disabled beats all.
    states: {
      default: null,
      hover: '&:hover',
      focus: '&:focus-visible',
      today: `&.${P}-today`,
      selected: `&.${P}-selected`,
      filled: `&.${P}-filled`,
      error: `&.${P}-error`,
      disabled: `&.${P}-disabled`,
    },
    overlaps: { focus: ['hover'] },
  },
  flutter: {},
  // How each platform reaches what the IR names, where not by its own name (src/shells/api.mjs).
  // The day's figure is the React child, and Flutter's label, a String, as a drawn one's is.
  api: {
    react: { day: 'children' },
    flutter: { disabled: 'onPressed', day: 'label' },
  },
};
