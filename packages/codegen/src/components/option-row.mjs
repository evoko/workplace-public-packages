/**
 * SOLAR Option Row, beyond its IR: where MUI draws each layer. Its shells are files of their own,
 * written by hand. One file per component, so adding one edits nothing shared;
 * `src/components/index.mjs` finds them.
 *
 * A drawn row (`src/components/shared/drawn.mjs`) around a SOLAR Checkbox, Radio or Toggle, which the whole
 * row names and targets: a <label> on the web; in Flutter a row that taps its control, hovers it,
 * and merges their semantics.
 */

import { drawnResets } from './shared/drawn.mjs';

const P = 'SolarOptionRow';

export default {
  name: 'Option Row',
  mui: {
    // The shell draws every layer itself, each with a class of its own; the row is a <label>.
    slots: 'drawn',
    // A block, as a row spans its column; its words wrap, as the description says a long one does.
    resets: drawnResets('Option Row', {
      display: 'flex',
      cursor: 'pointer',
      [`& .${P}--label, & .${P}-supportingText`]: { whiteSpace: 'normal' },
      [`& .${P}--control, & .${P}--toggle`]: { flexShrink: '0' },
    }),
  },
  flutter: {},
};
