/**
 * SOLAR PropertyRow, beyond its IR: where MUI draws each layer. Its shells are files of their own,
 * written by hand. One file per component, so adding one edits nothing shared;
 * `src/components/index.mjs` finds them.
 *
 * One label–value row of a PropertyList, drawn by the shared layer helpers
 * (`src/components/shared/drawn.mjs`): an optional leading icon, its words (a <dt> in a list) and
 * the caller's control (a <dd>). Its trailing follows from the control it is given.
 */

import { drawnResets } from './shared/drawn.mjs';

const P = 'SolarPropertyRow';

export default {
  name: 'PropertyRow',
  mui: {
    // The shell draws every layer itself, each with a class of its own.
    slots: 'drawn',
    // A row that spans its list; its words wrap, a <dt> and a <dd> no box of their own beyond the
    // recipe's; its icon and control keep their size.
    resets: drawnResets('PropertyRow', {
      display: 'flex',
      [`& .${P}-label, & .${P}-description`]: { whiteSpace: 'normal' },
      [`& .${P}--text, & .${P}--trailing`]: { margin: '0' },
      [`& .${P}-leading, & .${P}--trailing`]: { flexShrink: '0' },
      [`& .${P}-leading > svg`]: {
        display: 'block',
        width: '100%',
        height: '100%',
      },
    }),
  },
  flutter: {},
};
