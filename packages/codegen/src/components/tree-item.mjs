/**
 * SOLAR Tree Item, beyond its IR: where MUI draws each layer and marks each state. Its shells are
 * files of their own, written by hand. One file per component, so adding one edits nothing shared;
 * `src/components/index.mjs` finds them.
 *
 * One row of a tree, drawn by the shared layer helpers: its indent (a .Tree Indent of its depth), a
 * chevron that expands it, and a Checkbox, icons, a StatusIndicator, a Tag, a Counter and its two
 * actions as the caller gives them. Editing, its label is a text field, a rename; a keyboard-focused
 * row draws edit's edge and ring (owner decision 2026-09-24). The tree around it is the Tree
 * Navigation Panel pattern's, later.
 */

import { drawnResets } from './shared/drawn.mjs';

const P = 'SolarTreeItem';

export default {
  name: 'Tree Item',
  mui: {
    // The shell draws every layer itself, each with a class of its own.
    slots: 'drawn',
    // A row, no outline of the browser's own (its focus is edit's edge and ring); its buttons and
    // its rename field none of theirs; a caller's icons fill their slots; the words take what is
    // left, cut short. The chevron and the actions keep their own boxes as targets: 16px, 4px from
    // the next control, where two 44 × 44 targets would cover each other (as Number Input's side
    // stepper keeps Figma's size); the design review asks SOLAR.
    resets: drawnResets('Tree Item', {
      display: 'flex',
      outline: 'none',
      cursor: 'pointer',
      borderStyle: 'solid',
      [`& .${P}--chevron, & .${P}--iconMore, & .${P}--iconPlus`]: {
        appearance: 'none',
        border: '0',
        padding: '0',
        margin: '0',
        background: 'none',
        color: 'inherit',
        cursor: 'pointer',
        flexShrink: '0',
      },
      [`& .${P}--iconMore > svg, & .${P}--iconPlus > svg, & .${P}-leadingIcon > svg, & .${P}-trailingIcon > svg`]:
        { display: 'block', width: '100%', height: '100%' },
      [`& .${P}--label`]: {
        flex: '1 1 0%',
        minWidth: '0',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
      },
      [`& .${P}--renameInput`]: {
        flex: '1 1 0%',
        minWidth: '0',
        border: '0',
        padding: '0',
        margin: '0',
        background: 'none',
        outline: 'none',
      },
    }),
    // Hovered as the pointer is; focused as the keyboard reaches it; editing by the shell's class.
    states: {
      default: null,
      hover: '&:hover',
      focus: '&:focus-visible',
      edit: `&.${P}-edit`,
    },
    overlaps: { focus: ['hover'] },
  },
  flutter: {},
  // How each platform reaches what the IR names, where not by its own name (src/shells/api.mjs).
  // How both take what Figma's slots show: the chevron by whether the row has children, the
  // checkbox by its checked state, the counter by its count; the actions are the shell's own,
  // drawn where the caller gives them their callbacks.
  api: {
    react: {
      chevron: 'expandable',
      checkbox: 'checked',
      counter: 'count',
      buttons: null,
    },
    flutter: {
      chevron: 'expandable',
      checkbox: 'checked',
      counter: 'count',
      buttons: null,
    },
  },
};
