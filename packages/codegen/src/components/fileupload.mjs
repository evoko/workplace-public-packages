/**
 * SOLAR FileUpload, beyond its IR: where MUI draws each layer and marks each state. Its shells are
 * files of their own, written by hand. One file per component, so adding one edits nothing shared;
 * `src/components/index.mjs` finds them.
 *
 * A drop zone with a Browse button (a SOLAR Button), and, once a file is chosen, its name with
 * replace and remove buttons (SOLAR Icon Buttons). A real file input on the web; in Flutter, which
 * has no file picker of its own, the files the app's picker chose. Filled follows the files (the
 * overlay's `derive`).
 */

import { drawnResets } from './shared/drawn.mjs';

const P = 'SolarFileUpload';

export default {
  name: 'FileUpload',
  mui: {
    // The shell draws every layer itself, each with a class of its own; Browse, replace and remove
    // are SOLAR's buttons.
    slots: 'drawn',
    resets: drawnResets('FileUpload', {
      // The file's name takes the room the buttons leave, cut short where it runs out.
      [`& .${P}--fileName`]: {
        flex: '1 1 0%',
        minWidth: '0',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
      },
      [`& .${P}-helper`]: { whiteSpace: 'normal' },
    }),
    // Hovered as its drop zone is, or while a file is dragged over it; focused as a button in it
    // is by the keyboard; filled, in error and disabled by the shell's classes.
    states: {
      default: null,
      hover: `&:has(.${P}--field:hover), &.${P}-dragging`,
      focus: `&:has(.${P}--field :focus-visible)`,
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
