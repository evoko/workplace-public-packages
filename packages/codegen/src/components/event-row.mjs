/**
 * SOLAR Event Row, beyond its IR: where MUI draws each layer and marks each state. Its shells are
 * files of their own, written by hand. One file per component, so adding one edits nothing shared;
 * `src/components/index.mjs` finds them.
 *
 * A row of the card family (`src/components/shared/card.mjs`): one event of an activity feed, its leading
 * Avatar, its title and meta line, its time, and a More menu; pressable where it is given
 * something to do.
 */

import { cardResets, cardStates } from './shared/card.mjs';

export default {
  name: 'Event Row',
  mui: {
    // The shell draws every layer itself, each with a class of its own (shared/card.mjs).
    slots: 'drawn',
    resets: cardResets('Event Row', {
      wrap: ['title', 'metaText'],
      more: 'more',
      fixed: ['leading', 'timestamp'],
    }),
    states: cardStates('Event Row'),
    overlaps: { focus: ['hover'] },
  },
  flutter: {},
  // How each platform reaches what the IR names, where not by its own name (src/shells/api.mjs).
  api: {
    react: {
      productTag: 'product',
      metaText: 'meta',
      more: 'moreItems',
    },
    flutter: {
      productTag: 'product',
      metaText: 'meta',
      more: 'moreItems',
    },
  },
};
