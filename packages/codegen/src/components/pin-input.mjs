/**
 * SOLAR PIN Input, beyond its IR: where MUI draws each layer and marks each state. Its shells are
 * files of their own, written by hand. One file per component, so adding one edits nothing shared;
 * `src/components/index.mjs` finds them.
 *
 * A code of one digit per cell, `length` of them (owner decision 2026-09-24: 4 to 6), held by one
 * native input laid invisible over the cells. The cell the next digit goes in is drawn as Figma's
 * first, the one that takes the hover and the focus and shows the caret; the rest as Figma's rest.
 * Filled follows the code (the overlay's `derive`).
 */

import { drawnResets } from './shared/drawn.mjs';

const P = 'SolarPINInput';

export default {
  name: 'PIN Input',
  mui: {
    // The shell draws every layer itself, each with a class of its own; the code is one native
    // input over the cells.
    slots: 'drawn',
    resets: drawnResets('PIN Input', {
      // The input holds the code, invisible over the cells, which a tap anywhere on them focuses.
      [`& .${P}--cells`]: { position: 'relative' },
      [`& .${P}-input`]: {
        position: 'absolute',
        inset: '0',
        width: '100%',
        height: '100%',
        margin: '0',
        padding: '0',
        border: '0',
        opacity: '0',
        cursor: 'text',
        font: 'inherit',
      },
      [`& .${P}-input:disabled`]: { cursor: 'default' },
      [`& .${P}-helper, & .${P}-errorMessage`]: { whiteSpace: 'normal' },
    }),
    // Hovered as its cells are, focused as its input is; filled, in error and disabled by the
    // shell's classes.
    states: {
      default: null,
      hover: `&:has(.${P}--cells:hover)`,
      focus: `&:has(.${P}-input:focus)`,
      filled: `&.${P}-filled`,
      error: `&.${P}-error`,
      disabled: `&.${P}-disabled`,
    },
    overlaps: { focus: ['hover'] },
  },
  flutter: {},
  // How each platform reaches what the IR names, where not by its own name (src/shells/api.mjs).
  // A field's label is its `label`, as Text Input's is.
  // Flutter holds the code in its controller.
  api: {
    react: { label: 'label' },
    // Flutter's word for a field that takes input (rule 5, owner decision 2026-09-25).
    flutter: { value: 'controller', disabled: { not: 'enabled' } },
  },
};
