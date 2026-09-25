/**
 * SOLAR Launch Card, beyond its IR: where MUI draws each layer and marks each state. Its shells are
 * files of their own, written by hand. One file per component, so adding one edits nothing shared;
 * `src/components/index.mjs` finds them.
 *
 * A card of the family (`src/components/shared/card.mjs`): an app to open, its image (the caller's picture,
 * a favourite on it), its App Icon, name and Tag, its words, and its actions, the caller's Button
 * Group; pressable where it is given something to do.
 */

import { cardResets, cardStates } from './shared/card.mjs';

const P = 'SolarLaunchCard';

export default {
  name: 'Launch Card',
  mui: {
    // The shell draws every layer itself, each with a class of its own (shared/card.mjs). The
    // picture fills the image, cut to the card's corners.
    slots: 'drawn',
    resets: cardResets('Launch Card', {
      wrap: ['bodyText'],
      fixed: ['appIcon', 'tag', 'favouriteNoImage'],
      extra: {
        overflow: 'hidden',
        [`& .${P}-image`]: { position: 'relative' },
        [`& .${P}-image > img`]: {
          position: 'absolute',
          inset: '0',
          width: '100%',
          height: '100%',
          objectFit: 'cover',
        },
        [`& .${P}-appIcon > img`]: {
          display: 'block',
          width: '100%',
          height: '100%',
        },
        [`& .${P}-actions > *`]: { width: '100%' },
      },
    }),
    states: cardStates('Launch Card'),
    overlaps: { focus: ['hover'] },
  },
  flutter: {},
  // How each platform reaches what the IR names, where not by its own name (src/shells/api.mjs).
  api: {
    react: { favouriteNoImage: 'favourite', bodyText: 'body' },
    flutter: { favouriteNoImage: 'favourite', bodyText: 'body' },
  },
};
