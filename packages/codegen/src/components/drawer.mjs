/**
 * SOLAR Drawer, beyond its IR: where MUI draws each layer. Its shells are files of their own,
 * written by hand. One file per component, so adding one edits nothing shared;
 * `src/components/index.mjs` finds them.
 *
 * A panel at the viewport's end edge: MUI's Drawer, its paper the panel drawn from Figma's layers
 * by the shared helpers (`src/components/shared/drawn.mjs`), its backdrop SOLAR's Scrim; its title
 * and close button, the caller's content, and an optional footer.
 */

import { drawnResets } from './shared/drawn.mjs';

const P = 'SolarDrawer';

export default {
  name: 'Drawer',
  mui: {
    // The shell draws every layer itself, inside MUI's Drawer paper, each with a class of its own.
    slots: 'drawn',
    // A column of its parts, the panel the recipe's alone; its title wraps, its content scrolls.
    resets: drawnResets('Drawer', {
      display: 'flex',
      backgroundImage: 'none',
      maxWidth: '100%',
      [`& .${P}-title`]: { whiteSpace: 'normal', minWidth: '0' },
      [`& .${P}-content`]: { overflowY: 'auto', minHeight: '0' },
      [`& .${P}--close`]: { flexShrink: '0' },
    }),
  },
  flutter: {},
  // How each platform reaches what the IR names, where not by its own name (src/shells/api.mjs).
  // Its footer is its actions, as a Dialog's are; its content is React's children and, as
  // SolarDialog's, Flutter's `content`.
  api: {
    react: { cta: 'actions' },
    flutter: { cta: 'actions', content: 'content' },
  },
};
