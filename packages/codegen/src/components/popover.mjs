/**
 * SOLAR Popover, beyond its IR: where MUI draws each layer. Its shells are files of their own,
 * written by hand. One file per component, so adding one edits nothing shared;
 * `src/components/index.mjs` finds them.
 *
 * An anchored overlay for rich content: the bubble and its tip drawn from Figma's layers by the
 * shared helpers (`src/components/shared/drawn.mjs`), in MUI's Popover paper; the surface alone, in
 * place, where it has no anchor.
 */

import { drawnResets } from './shared/drawn.mjs';

export default {
  name: 'Popover',
  mui: {
    // The shell draws every layer itself, each with a class of its own.
    slots: 'drawn',
    // Its words wrap within the bubble; the tip keeps its size beside the bubble.
    resets: drawnResets('Popover', {
      '& .SolarPopover-title, & .SolarPopover-body': { whiteSpace: 'normal' },
      '& .SolarPopover--tip': { flexShrink: 0 },
    }),
  },
  flutter: {},
};
