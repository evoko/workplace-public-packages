/**
 * SOLAR Context Menu Item, beyond its IR: where MUI draws each layer and marks each state. Its
 * shells are files of their own, written by hand. One file per component, so adding one edits
 * nothing shared; `src/components/index.mjs` finds them.
 *
 * One row of a Context Menu: MUI's MenuItem on the web, as a Dropdown Item is, drawn and pressable
 * in Flutter, its icons, words and shortcut drawn by the shared layer helpers.
 */

import { drawnResets } from './shared/drawn.mjs';

const P = 'SolarContextMenuItem';

export default {
  name: 'Context Menu Item',
  mui: {
    // The shell draws every layer itself, inside MUI's MenuItem, each with a class of its own.
    slots: 'drawn',
    // MenuItem's own look gives way to the recipe's, as a Dropdown Item's does. A row spans its
    // menu; its icons keep their size, and a caller's icon fills its slot.
    resets: drawnResets('Context Menu Item', {
      display: 'flex',
      minHeight: '0',
      '&.Mui-disabled': { opacity: '1' },
      [`& .${P}-leadingIcon, & .${P}-trailingIcon`]: { flexShrink: '0' },
      [`& .${P}-leadingIcon > svg, & .${P}-trailingIcon > svg`]: {
        display: 'block',
        width: '100%',
        height: '100%',
      },
    }),
    // Figma draws the focus: the menu's keyboard highlight, a row's own look.
    states: {
      default: null,
      hover: '&:hover',
      focus: '&.Mui-focusVisible',
      disabled: '&.Mui-disabled',
    },
  },
  flutter: {},
  // How each platform reaches what the IR names, where not by its own name (src/shells/api.mjs).
  // Flutter disables it as its own controls: by a null onPressed.
  api: {
    flutter: { disabled: 'onPressed' },
  },
};
