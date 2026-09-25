/**
 * SOLAR Row, beyond its IR: where MUI draws each layer and marks each state. Its shells are files
 * of their own, written by hand. One file per component, so adding one edits nothing shared;
 * `src/components/index.mjs` finds them.
 *
 * One row of a Table: MUI's TableRow as a flex box of its cells, drawn by the shared layer helpers
 * (`src/components/shared/drawn.mjs`): its RowSelect and RowExpand cells where it is selectable and
 * expandable, then the caller's Column Items. A top row's expand cell is a button. A row given
 * something to do draws its hover (owner decision 2026-09-25); a selected one keeps its fill.
 */

import { drawnResets } from './shared/drawn.mjs';

const P = 'SolarRow';

export default {
  name: 'Row',
  mui: {
    // The shell draws every layer itself, inside MUI's TableRow, each with a class of its own.
    slots: 'drawn',
    // A block that spans its table, not a table row: its cells are flex items that share it. A top
    // row's expand cell is the button, a button's own look given way to the RowExpand's.
    resets: drawnResets('Row', {
      display: 'flex',
      verticalAlign: 'initial',
      [`& .${P}-cells`]: { minWidth: '0' },
      [`& .${P}-expandButton`]: {
        border: '0',
        margin: '0',
        font: 'inherit',
        color: 'inherit',
        cursor: 'pointer',
      },
      [`& .${P}-expandButton:focus-visible`]: {
        outline: 'none',
        boxShadow: 'var(--solar-shadow-focus-default)',
      },
      [`&.${P}-pressable`]: { cursor: 'pointer' },
    }),
    // Hovered only where it is given something to do; a selected row keeps its fill under the
    // pointer. Each is a class the shell sets, as MUI's own hover and selected are not the recipe's.
    states: {
      default: null,
      hover: `&.${P}-pressable:hover`,
      selected: `&.${P}-selected`,
    },
  },
  flutter: {},
  // How each platform reaches what the IR names, where not by its own name (src/shells/api.mjs).
  // The select and expand cells are the row's own, drawn where it is selectable and expandable;
  // its cells are its children.
  api: {
    react: {
      checkBox: 'selectable',
      expand: 'expandable',
      titleRowContent: 'children',
    },
    flutter: {
      checkBox: 'selectable',
      expand: 'expandable',
      titleRowContent: 'cells',
    },
  },
};
