/**
 * SOLAR TableHeader, beyond its IR: where MUI draws each layer. Its shells are files of their own,
 * written by hand. One file per component, so adding one edits nothing shared;
 * `src/components/index.mjs` finds them.
 *
 * The toolbar above a Table, drawn by the shared layer helpers (`src/components/shared/drawn.mjs`):
 * the caller's SearchField, Segmented Control and actions, spread across it.
 */

import { drawnResets } from './shared/drawn.mjs';

const P = 'SolarTableHeader';

export default {
  name: 'TableHeader',
  mui: {
    // The shell draws every layer itself, each with a class of its own.
    slots: 'drawn',
    // A strip that spans its table; the caller's controls keep their own size.
    resets: drawnResets('TableHeader', {
      display: 'flex',
      [`& .${P}-search, & .${P}-segmentedControl, & .${P}-segmentedControlMobile`]:
        { flexShrink: '0' },
    }),
  },
  flutter: {},
  // How each platform reaches what the IR names, where not by its own name (src/shells/api.mjs).
  // Mobile draws the same Segmented Control and actions in layers of its own; its actions are its
  // children.
  api: {
    react: {
      segmentedControlMobile: 'segmentedControl',
      actions: 'children',
      actionsMobile: 'children',
    },
    flutter: {
      segmentedControlMobile: 'segmentedControl',
      actions: 'actions',
      actionsMobile: 'actions',
    },
  },
};
