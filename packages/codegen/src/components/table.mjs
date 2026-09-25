/**
 * SOLAR Table, beyond its IR: where MUI draws each layer. Its shells are files of their own,
 * written by hand. One file per component, so adding one edits nothing shared;
 * `src/components/index.mjs` finds them.
 *
 * A data table's chassis: MUI's Table as a flex column of its header row and the caller's rows,
 * drawn by the shared layer helpers (`src/components/shared/drawn.mjs`), with Figma's fade at its
 * right edge on mobile. It tells its rows whether they draw their select and expand cells.
 */

import { drawnResets } from './shared/drawn.mjs';

const P = 'SolarTable';

export default {
  name: 'Table',
  mui: {
    // The shell draws every layer itself, inside MUI's Table, each with a class of its own.
    slots: 'drawn',
    // A block that spans what holds it, not a table: its rows are flex boxes that share its width.
    // The fade is drawn over the rows, and takes no pointer.
    resets: drawnResets('Table', {
      display: 'flex',
      borderCollapse: 'initial',
      [`& .${P}--dimming`]: { pointerEvents: 'none' },
    }),
  },
  flutter: {},
  // How each platform reaches what the IR names, where not by its own name (src/shells/api.mjs).
  // Its rows are its children.
  api: {
    react: { rows: 'children' },
    flutter: { rows: 'rows' },
  },
};
