/**
 * SOLAR Options List, beyond its IR: where MUI draws each layer. Its shells are files of their own,
 * written by hand. One file per component, so adding one edits nothing shared;
 * `src/components/index.mjs` finds them.
 *
 * A drawn fieldset (`src/components/shared/drawn.mjs`) whose content layer holds the caller's Option Rows in
 * place of Figma's examples, named by a legend a screen reader reads and Figma does not draw (owner
 * decision 2026-09-24).
 */

import { drawnResets } from './shared/drawn.mjs';

const P = 'SolarOptionsList';

export default {
  name: 'Options List',
  mui: {
    // The shell draws every layer itself, each with a class of its own; the root is a fieldset.
    slots: 'drawn',
    // A fieldset has none of the browser's own edge, gap or width, and its legend is hidden, as
    // Figma draws none: a screen reader reads it.
    resets: drawnResets('Options List', {
      display: 'flex',
      flexDirection: 'column',
      margin: '0',
      minWidth: '0',
      border: '0',
      padding: '0',
      [`& .${P}-legend`]: {
        position: 'absolute',
        width: '1px',
        height: '1px',
        padding: '0',
        overflow: 'hidden',
        clipPath: 'inset(50%)',
        whiteSpace: 'nowrap',
      },
      [`& .${P}-content > *`]: { width: '100%' },
    }),
  },
  flutter: {},
};
