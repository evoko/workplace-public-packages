/**
 * SOLAR Expandable Card, beyond its IR: where MUI draws each layer and marks each state. Its shells
 * are files of their own, written by hand. One file per component, so adding one edits nothing
 * shared; `src/components/index.mjs` finds them.
 *
 * A drawn card (`src/components/shared/drawn.mjs`) whose header is a disclosure: the button that shows and
 * hides its content, announced expanded or collapsed; the card's edge and focus ring follow the
 * header's states.
 */

import { drawnResets } from './shared/drawn.mjs';

const P = 'SolarExpandableCard';

export default {
  name: 'Expandable Card',
  mui: {
    // The shell draws every layer itself, each with a class of its own; the header is a bare
    // button. A card is a block, and its words wrap.
    slots: 'drawn',
    resets: drawnResets('Expandable Card', {
      display: 'flex',
      [`& .${P}-title, & .${P}-description`]: {
        whiteSpace: 'normal',
        minWidth: '0',
        textAlign: 'start',
      },
      [`& .${P}--header`]: {
        padding: '0',
        margin: '0',
        font: 'inherit',
        color: 'inherit',
      },
    }),
    // Hovered as the pointer is on its header, focused as the keyboard is (MUI marks it
    // focus-visible): the card's look follows its header's.
    states: {
      default: null,
      hover: `&:has(.${P}--header:hover)`,
      focus: `&:has(.${P}--header.Mui-focusVisible)`,
    },
    overlaps: { focus: ['hover'] },
  },
  flutter: {},
};
