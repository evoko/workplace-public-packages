/**
 * SOLAR PaginationNav, beyond its IR: where MUI draws each layer and marks each state. Its shells
 * are files of their own, written by hand. One file per component, so adding one edits nothing
 * shared; `src/components/index.mjs` finds them.
 *
 * The previous or next arrow of a Pagination: MUI's ButtonBase on the web, drawn and pressable in
 * Flutter, its chevron drawn by the shared layer helpers, pointing the way it goes. Its own 24 × 24
 * box is its target, as a PaginationItem's.
 */

import { drawnResets } from './shared/drawn.mjs';

const P = 'SolarPaginationNav';

export default {
  name: 'PaginationNav',
  mui: {
    // The shell draws every layer itself, inside MUI's ButtonBase, each with a class of its own.
    slots: 'drawn',
    resets: drawnResets('PaginationNav', {
      display: 'flex',
      [`& .${P}--icon > svg`]: {
        display: 'block',
        width: '100%',
        height: '100%',
      },
      // Mirrored by the layout's direction, not by the prop, as its description says.
      [`&:dir(rtl) .${P}--icon`]: { transform: 'scaleX(-1)' },
    }),
    // Hovered, pressed and focused as the pointer and the keyboard reach it (MUI marks the
    // keyboard's focus-visible); disabled as MUI marks it.
    states: {
      default: null,
      hover: '&:hover',
      pressed: '&:active',
      focus: '&.Mui-focusVisible',
      disabled: '&.Mui-disabled',
    },
    overlaps: { pressed: ['hover'], focus: ['hover'] },
  },
  flutter: {},
  // How each platform reaches what the IR names, where not by its own name (src/shells/api.mjs).
  // Flutter disables it as its own controls: by a null onPressed.
  api: {
    flutter: { disabled: 'onPressed' },
  },
};
