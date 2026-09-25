/**
 * SOLAR Column Item, beyond its IR: where MUI draws each layer and marks each state. Its shells are
 * files of their own, written by hand. One file per component, so adding one edits nothing shared;
 * `src/components/index.mjs` finds them.
 *
 * One cell of a Table's Row: a column header or a data cell, drawn by the shared layer helpers
 * (`src/components/shared/drawn.mjs`). Its type follows from what it is given (words, an Avatar, a
 * Tag, an icon, a Text Input, a Dropdown, a Button or a Toggle). A header that sorts has its words
 * in a button, and the cell draws SOLAR's focus ring while the keyboard is on it.
 */

import { drawnResets } from './shared/drawn.mjs';

const P = 'SolarColumnItem';

export default {
  name: 'Column Item',
  mui: {
    // The shell draws every layer itself, each with a class of its own.
    slots: 'drawn',
    // A cell takes its share of the row and shrinks with it, its words cut short. The caller's
    // components keep their own size; a field fills the cell. The sort button is the header's
    // words, no box of its own. A numeric column's words sit at the end, as the description says
    // ("numeric text right-aligns").
    resets: drawnResets('Column Item', {
      display: 'flex',
      minWidth: '0',
      flexShrink: '1',
      [`& .${P}-label, & .${P}-name`]: {
        minWidth: '0',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
      },
      [`& .${P}-avatar, & .${P}-tag, & .${P}-icon, & .${P}-button, & .${P}-toggle`]:
        { flexShrink: '0' },
      [`& .${P}-icon > svg`]: {
        display: 'block',
        width: '100%',
        height: '100%',
      },
      [`& .${P}-sort`]: {
        all: 'unset',
        cursor: 'pointer',
        minWidth: '0',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
      },
      [`&.${P}-numeric`]: { justifyContent: 'flex-end' },
      [`&.${P}-numeric .${P}-label, &.${P}-numeric .${P}-name`]: {
        textAlign: 'end',
      },
    }),
    // A header that sorts is focused while the keyboard is on its button.
    states: {
      default: null,
      focus: `&:has(.${P}-sort:focus-visible)`,
    },
  },
  flutter: {},
  // How each platform reaches what the IR names, where not by its own name (src/shells/api.mjs).
  // A user cell's name is the cell's words, as every cell's are.
  api: {
    react: { name: 'children' },
    flutter: { name: 'label' },
  },
};
