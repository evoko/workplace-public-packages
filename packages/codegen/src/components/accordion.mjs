/**
 * SOLAR Accordion, beyond its IR: where MUI draws each layer and marks each state. Its shells are
 * files of their own, written by hand. One file per component, so adding one edits nothing shared;
 * `src/components/index.mjs` finds them.
 *
 * One item of an accordion, drawn from Figma's layers (`src/components/shared/drawn.mjs`). Collapsed, the
 * item is its header, a disclosure button. Expanded, Figma draws it as its own collapsed header,
 * nested, over the content: the shells draw that header with the collapsed item's own look, a
 * button announced expanded, hovered with the item as Figma draws it.
 */

import { drawnResets } from './shared/drawn.mjs';

const P = 'SolarAccordion';

export default {
  name: 'Accordion',
  mui: {
    // The shell draws every layer itself, each with a class of its own; the header is a bare
    // button, its words wrapping. Expanded, its chevron is turned up.
    slots: 'drawn',
    resets: drawnResets('Accordion', {
      display: 'flex',
      padding: '0',
      margin: '0',
      font: 'inherit',
      color: 'inherit',
      textAlign: 'start',
      [`& .${P}-title, & .${P}-description`]: {
        whiteSpace: 'normal',
        minWidth: '0',
      },
      [`&.${P}-expanded > .${P}--accordion .${P}--iconChevronDown`]: {
        transform: 'rotate(180deg)',
      },
    }),
    // Hovered as the pointer is over the item: its header, or the expanded item, whose nested
    // header is hovered with it, as Figma draws it. Focused as the keyboard reaches the header
    // (MUI marks it focus-visible); disabled by the shell's class.
    states: {
      default: null,
      hover: `&:hover, .${P}-expanded:hover > &`,
      focus: '&.Mui-focusVisible',
      disabled: `&.${P}-disabled`,
    },
    overlaps: { focus: ['hover'] },
  },
  flutter: {},
};
