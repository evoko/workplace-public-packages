/**
 * SOLAR Action Card, beyond its IR: where MUI draws each layer and marks each state. Its shells are
 * files of their own, written by hand. One file per component, so adding one edits nothing shared;
 * `src/components/index.mjs` finds them.
 *
 * A card of the family (`src/components/shared/card.mjs`): an icon, a title and a More menu, the content,
 * and its calls to action, the caller's Buttons, as its status draws them (two at rest, the
 * primary alone once done or in danger); pressable where it is given something to do.
 */

import { cardResets, cardStates } from './shared/card.mjs';

export default {
  name: 'Action Card',
  mui: {
    // The shell draws every layer itself, each with a class of its own (shared/card.mjs).
    slots: 'drawn',
    resets: cardResets('Action Card', {
      wrap: ['titleTitle', 'description'],
      more: 'iconMore',
      icons: ['icon'],
      extra: { '& .SolarActionCard-content': { display: 'flex' } },
    }),
    states: cardStates('Action Card'),
    overlaps: { focus: ['hover'] },
  },
  flutter: {},
  // How each platform reaches what the IR names, where not by its own name (src/shells/api.mjs).
  api: {
    react: {
      primaryCTA: 'primaryAction',
      secondaryCTA: 'secondaryAction',
    },
    flutter: {
      primaryCTA: 'primaryAction',
      secondaryCTA: 'secondaryAction',
    },
  },
};
