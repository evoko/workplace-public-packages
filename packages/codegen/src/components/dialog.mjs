/**
 * SOLAR Dialog, beyond its IR: where MUI draws each layer. Its shells are files of their own,
 * written by hand. One file per component, so adding one edits nothing shared;
 * `src/components/index.mjs` finds them.
 *
 * A modal dialog: MUI's Dialog, its paper the surface drawn from Figma's layers by the shared
 * helpers (`src/components/shared/drawn.mjs`), its backdrop SOLAR's Scrim. Its title (or, in the
 * image dialog, its title and words under the picture), the caller's content and a footer Button
 * Group, its own close button. Drawn in place where the caller asks.
 */

import { drawnResets } from './shared/drawn.mjs';

const P = 'SolarDialog';

export default {
  name: 'Dialog',
  mui: {
    // The shell draws every layer itself, inside MUI's Dialog paper, each with a class of its own.
    slots: 'drawn',
    // A column of its parts, the surface the recipe's alone: MUI's paper gives up its own fill
    // overlay, and its width limit (the recipe's is SOLAR's). The words wrap; the picture fills
    // its header, the close button over it.
    resets: drawnResets('Dialog', {
      display: 'flex',
      backgroundImage: 'none',
      maxWidth: 'calc(100% - 2 * var(--solar-inset-xl))',
      [`& .${P}-title, & .${P}-imageTitle, & .${P}-description`]: {
        whiteSpace: 'normal',
        minWidth: '0',
      },
      [`& .${P}-icon > svg`]: {
        display: 'block',
        width: '100%',
        height: '100%',
      },
      [`& .${P}-modalImage`]: { position: 'relative', overflow: 'hidden' },
      [`& .${P}-modalImage > img, & .${P}-modalImage > video`]: {
        position: 'absolute',
        inset: '0',
        width: '100%',
        height: '100%',
        objectFit: 'cover',
      },
      [`& .${P}--imageClose`]: { zIndex: '1' },
      [`& .${P}--leading, & .${P}--close`]: { flexShrink: '0' },
    }),
  },
  flutter: {},
  // How each platform reaches what the IR names, where not by its own name (src/shells/api.mjs).
  // The image dialog's title is the dialog's one title; its picture its `image`.
  api: {
    react: { imageTitle: 'title', modalImage: 'image' },
    flutter: { imageTitle: 'title', modalImage: 'image' },
  },
};
