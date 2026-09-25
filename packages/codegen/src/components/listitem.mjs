/**
 * SOLAR ListItem, beyond its IR: where MUI draws each layer and marks each state. Its shells are
 * files of their own, written by hand. One file per component, so adding one edits nothing shared;
 * `src/components/index.mjs` finds them.
 *
 * One row of a List: MUI's ListItemButton on the web, drawn and pressable in Flutter, its icon or
 * avatar, words and trailing icon drawn by the shared layer helpers. Its type follows from what it
 * is given (an avatar), and in a List it takes the list's compactness, as Figma draws its rows.
 */

import { drawnResets } from './shared/drawn.mjs';

const P = 'SolarListItem';

export default {
  name: 'ListItem',
  mui: {
    // The shell draws every layer itself, inside MUI's ListItemButton, each with a class of its own.
    slots: 'drawn',
    // ListItemButton's own look gives way to the recipe's: its faded disabled row (the recipe draws
    // Figma's) and its focus fill (Figma's focus is a ring). A row spans its list; its icons and
    // avatar keep their size, and a caller's icon fills its slot.
    resets: drawnResets('ListItem', {
      display: 'flex',
      '&.Mui-focusVisible': { backgroundColor: 'transparent' },
      '&.Mui-disabled': { opacity: '1' },
      [`& .${P}-icon, & .${P}-trailing, & .${P}-avatar`]: { flexShrink: '0' },
      [`& .${P}-icon > svg, & .${P}-trailing > svg`]: {
        display: 'block',
        width: '100%',
        height: '100%',
      },
      [`& .${P}-helper`]: { whiteSpace: 'normal' },
    }),
    // Figma draws the focus, a ring. A selected row keeps its fill under the pointer, and a
    // disabled one beats all; each is a class the shell sets, as MUI's own selected fill is not
    // the recipe's.
    states: {
      default: null,
      hover: '&:hover',
      focus: '&.Mui-focusVisible',
      selected: `&.${P}-selected`,
      disabled: '&.Mui-disabled',
    },
    overlaps: { focus: ['hover'] },
  },
  flutter: {},
  // How each platform reaches what the IR names, where not by its own name (src/shells/api.mjs).
  // Flutter disables it as its own controls: by a null onPressed.
  api: {
    flutter: { disabled: 'onPressed' },
  },
};
