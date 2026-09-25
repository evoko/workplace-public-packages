/**
 * SOLAR Image Card, beyond its IR: where MUI draws each layer and marks each state. Its shells are
 * files of their own, written by hand. One file per component, so adding one edits nothing shared;
 * `src/components/index.mjs` finds them.
 *
 * A tile of the card family (`src/components/shared/card.mjs`'s resets and states): an image, its title and
 * details, and a More menu; selectable by a SOLAR Checkbox, shown where it is selected and while
 * the pointer or the keyboard is on the tile, as Figma shows it hovered. Unfilled, the tile that
 * adds one. Pressable where it is given something to do.
 */

import { cardResets, cardStates } from './shared/card.mjs';

const P = 'SolarImageCard';

export default {
  name: 'Image Card',
  mui: {
    // The shell draws every layer itself, each with a class of its own (shared/card.mjs). The
    // image fills its frame, under the Checkbox, cut to the tile's corners.
    slots: 'drawn',
    resets: cardResets('Image Card', {
      wrap: ['title', 'subtitle', 'label'],
      more: 'iconControl',
      extra: {
        overflow: 'hidden',
        [`& .${P}--image`]: { position: 'relative' },
        [`& .${P}--image > img`]: {
          position: 'absolute',
          inset: '0',
          width: '100%',
          height: '100%',
          objectFit: 'cover',
        },
        [`& .${P}--checkbox`]: { position: 'relative' },
        [`& .${P}--iconControl`]: {
          margin: '0',
          background: 'none',
          border: '0',
        },
      },
    }),
    states: cardStates('Image Card'),
    overlaps: { focus: ['hover'] },
  },
  flutter: {},
  // How each platform reaches what the IR names, where not by its own name (src/shells/api.mjs).
  api: {
    react: { label: 'label' },
  },
};
