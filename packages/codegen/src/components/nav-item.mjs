/**
 * SOLAR Nav Item, beyond its IR: where MUI draws each layer and marks each state. Its shells are
 * files of their own, written by hand. One file per component, so adding one edits nothing shared;
 * `src/components/index.mjs` finds them.
 *
 * One destination of a sidebar or top bar: MUI's ButtonBase on the web (a link where it has an
 * `href`), drawn and pressable in Flutter, its icon and label drawn by the shared layer helpers.
 * Its icon is solid while selected, as Figma swaps it. A focused item draws SOLAR's focus ring,
 * which Figma draws none of (owner decision 2026-09-24).
 */

import { drawnResets } from './shared/drawn.mjs';
import { targetArea } from './shared/target.mjs';

const P = 'SolarNavItem';

export default {
  name: 'Nav Item',
  mui: {
    // The shell draws every layer itself, inside MUI's ButtonBase, each with a class of its own.
    slots: 'drawn',
    // A caller's icon fills its slot, which the recipe sizes and colours; a link is not
    // underlined. A 44 × 44 target around it, which takes no room.
    resets: drawnResets('Nav Item', {
      display: 'flex',
      textDecoration: 'none',
      [`& .${P}-iconOutline`]: { flexShrink: '0' },
      [`& .${P}-iconOutline > svg`]: {
        display: 'block',
        width: '100%',
        height: '100%',
      },
      ...targetArea(),
    }),
    // Hovered as the pointer is; focused as the keyboard reaches it (MUI marks it focus-visible).
    states: {
      default: null,
      hover: '&:hover',
      focus: '&.Mui-focusVisible',
    },
    overlaps: { focus: ['hover'] },
  },
  flutter: {},
  // How each platform reaches what the IR names, where not by its own name (src/shells/api.mjs).
  // An item's words are its `label`, which names it collapsed, where they are not drawn.
  api: {
    react: { label: 'label' },
  },
};
