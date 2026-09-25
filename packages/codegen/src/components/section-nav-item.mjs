/**
 * SOLAR Section Nav Item, beyond its IR: where MUI draws each layer and marks each state. Its
 * shells are files of their own, written by hand. One file per component, so adding one edits
 * nothing shared; `src/components/index.mjs` finds them.
 *
 * One item of a section nav rail (settings and admin sub-navigation), as Nav Item is of a
 * sidebar: MUI's ButtonBase on the web (a link where it has an `href`), drawn and pressable in
 * Flutter, its icon and label drawn by the shared layer helpers.
 */

import { drawnResets } from './shared/drawn.mjs';

const P = 'SolarSectionNavItem';

export default {
  name: 'Section Nav Item',
  mui: {
    // The shell draws every layer itself, inside MUI's ButtonBase, each with a class of its own.
    slots: 'drawn',
    // A caller's icon fills its slot, which the recipe sizes and colours; a link is not
    // underlined. No padded target: the items touch in their rail, as a menu's rows do (owner
    // decision 2026-09-24 for rows), and each is its own box's target.
    resets: drawnResets('Section Nav Item', {
      display: 'flex',
      textDecoration: 'none',
      [`& .${P}-icon`]: { flexShrink: '0' },
      [`& .${P}-icon > svg`]: {
        display: 'block',
        width: '100%',
        height: '100%',
      },
    }),
    // Hovered as the pointer is; focused as the keyboard reaches it (MUI marks it focus-visible);
    // selected by the shell's class, and disabled as MUI marks it.
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
  // An item's words are its `label`, as a Nav Item's are.
  api: {
    react: { label: 'label' },
    flutter: { disabled: 'onPressed' },
  },
};
