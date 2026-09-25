/**
 * SOLAR Split Dialog, beyond its IR: where MUI draws each layer. Its shells are files of their own,
 * written by hand. One file per component, so adding one edits nothing shared;
 * `src/components/index.mjs` finds them.
 *
 * A modal dialog with two panes: MUI's Dialog, its paper the surface drawn from Figma's layers by
 * the shared helpers (`src/components/shared/drawn.mjs`), its backdrop SOLAR's Scrim; its title,
 * the caller's left and right content, and its actions, across its foot or under the left pane.
 */

import { drawnResets } from './shared/drawn.mjs';

const P = 'SolarSplitDialog';

export default {
  name: 'Split Dialog',
  mui: {
    // The shell draws every layer itself, inside MUI's Dialog paper, each with a class of its own.
    slots: 'drawn',
    // A column of its parts, the surface the recipe's alone; its title wraps.
    resets: drawnResets('Split Dialog', {
      display: 'flex',
      backgroundImage: 'none',
      maxWidth: 'calc(100% - 2 * var(--solar-inset-xl))',
      [`& .${P}-title`]: { whiteSpace: 'normal', minWidth: '0' },
      [`& .${P}-icon > svg`]: {
        display: 'block',
        width: '100%',
        height: '100%',
      },
      [`& .${P}--leading, & .${P}--close`]: { flexShrink: '0' },
    }),
  },
  flutter: {},
  // How each platform reaches what the IR names, where not by its own name (src/shells/api.mjs).
  // Its two panes are two contents, so neither is the children: each by its own name. The regular
  // dialog draws the same left content and actions where its cta puts them.
  api: {
    react: {
      left: 'left',
      right: 'right',
      leftRegular: 'left',
      actionsRegular: 'actions',
    },
    flutter: {
      left: 'left',
      right: 'right',
      leftRegular: 'left',
      actionsRegular: 'actions',
    },
  },
};
