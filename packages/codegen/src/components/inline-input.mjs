/**
 * SOLAR Inline Input, beyond its IR: where MUI draws each layer and marks each state. Its shells
 * are files of their own, written by hand. One file per component, so adding one edits nothing
 * shared; `src/components/index.mjs` finds them.
 *
 * A value edited in place, which holds its mode (owner decision 2026-09-24): read, its words, with
 * an edit button on hover; editing, MUI's InputBase on the web and an undecorated TextField in
 * Flutter, with Confirm and Cancel. Filled is the edit mode with the focus off the input (the
 * overlay's `derive`).
 */

import { drawnResets } from './shared/drawn.mjs';

const P = 'SolarInlineInput';

export default {
  name: 'Inline Input',
  mui: {
    // The shell draws every layer itself, each with a class of its own; editing, its value is
    // MUI's InputBase.
    slots: 'drawn',
    resets: drawnResets('Inline Input', {
      // Read, a click anywhere edits it.
      cursor: 'text',
      [`&.${P}-editing, &.${P}-disabled`]: { cursor: 'default' },
      // Read, the words take the room the edit button leaves, cut short where they run out.
      [`& .${P}-value`]: {
        flex: '1 1 0%',
        minWidth: '0',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
      },
      // Editing, InputBase's own box around the input takes no part in the row's layout.
      [`& .${P}-words`]: { display: 'contents' },
      [`& .${P}-value.MuiInputBase-input`]: {
        height: 'auto',
        padding: '0',
        WebkitTextFillColor: 'currentcolor',
      },
      // The edit button shows while it is hovered, or has the keyboard's focus, as Figma draws it
      // hovered; it keeps its room, so the words do not move.
      [`& .${P}--iconButton`]: { visibility: 'hidden' },
      [`&:hover .${P}--iconButton, & .${P}--iconButton:focus-within`]: {
        visibility: 'visible',
      },
    }),
    // Hovered as it is; focused as its input is; filled (editing, the focus off the input), in
    // error and disabled by the shell's classes.
    states: {
      default: null,
      hover: '&:hover',
      focus: `&:has(.${P}-words.Mui-focused)`,
      filled: `&.${P}-filled`,
      error: `&.${P}-error`,
      disabled: `&.${P}-disabled`,
    },
    overlaps: { focus: ['hover'] },
  },
  flutter: {},
  api: {
    // Flutter's word for a field that takes input (rule 5, owner decision 2026-09-25).
    flutter: { disabled: { not: 'enabled' } },
  },
};
