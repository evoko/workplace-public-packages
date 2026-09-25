/**
 * SOLAR PaginationItem, beyond its IR: where MUI draws each layer and marks each state. Its shells
 * are files of their own, written by hand. One file per component, so adding one edits nothing
 * shared; `src/components/index.mjs` finds them.
 *
 * One page of a Pagination: MUI's ButtonBase on the web, drawn and pressable in Flutter, its number
 * drawn by the shared layer helpers. Its own 24 × 24 box is its target (owner decision 2026-09-24:
 * the items sit 4px apart, where 44 × 44 targets would cover each other).
 */

import { drawnResets } from './shared/drawn.mjs';

export default {
  name: 'PaginationItem',
  mui: {
    // The shell draws every layer itself, inside MUI's ButtonBase, each with a class of its own.
    slots: 'drawn',
    resets: drawnResets('PaginationItem', { display: 'flex' }),
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
  // The page's number is the React child, and Flutter's `page`, an int.
  api: {
    react: { page: 'children' },
    flutter: { disabled: 'onPressed' },
  },
};
