/**
 * SOLAR File Card, beyond its IR: where MUI draws each layer and marks each state. Its shells are
 * files of their own, written by hand. One file per component, so adding one edits nothing shared;
 * `src/components/index.mjs` finds them.
 *
 * A tile of the card family (`src/components/shared/card.mjs`): one file of a file browser's grid, its
 * thumbnail (the caller's, or its type's icon), its name and when it changed, and a More menu; or
 * the tile that creates one. Pressable where it is given something to do.
 */

import { cardResets, cardStates } from './shared/card.mjs';

const P = 'SolarFileCard';

export default {
  name: 'File Card',
  mui: {
    // The shell draws every layer itself, each with a class of its own (shared/card.mjs). A
    // preview fills the thumbnail, cut to its corners.
    slots: 'drawn',
    resets: cardResets('File Card', {
      wrap: ['title', 'meta', 'label'],
      more: 'iconMore',
      icons: ['fileIcon'],
      extra: {
        [`& .${P}--thumbnail`]: { overflow: 'hidden' },
        [`& .${P}--thumbnail > img`]: {
          width: '100%',
          height: '100%',
          objectFit: 'cover',
        },
      },
    }),
    states: cardStates('File Card'),
    overlaps: { focus: ['hover'] },
  },
  flutter: {},
  // How each platform reaches what the IR names, where not by its own name (src/shells/api.mjs).
  api: {
    react: { label: 'title' },
    flutter: { label: 'title' },
  },
};
