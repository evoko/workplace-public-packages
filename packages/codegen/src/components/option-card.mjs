/**
 * SOLAR Option Card, beyond its IR: where MUI draws each layer and marks each state. Its shells are
 * files of their own, written by hand. One file per component, so adding one edits nothing shared;
 * `src/components/index.mjs` finds them.
 *
 * A tile of the card family (`src/components/shared/card.mjs`): a Plus in a circle over its label, to create
 * something new, as Figma draws it; pressable where it is given something to do, and selected as
 * the current one of its set.
 */

import { cardResets, cardStates } from './shared/card.mjs';

export default {
  name: 'Option Card',
  mui: {
    // The shell draws every layer itself, each with a class of its own (shared/card.mjs).
    slots: 'drawn',
    resets: cardResets('Option Card', {
      wrap: ['label'],
      icons: ['iconPlus'],
      extra: { '& .SolarOptionCard-label': { textAlign: 'center' } },
    }),
    states: cardStates('Option Card', { selected: true }),
    overlaps: { focus: ['hover', 'selected'], hover: ['selected'] },
  },
  flutter: {},
  // How each platform reaches what the IR names, where not by its own name (src/shells/api.mjs).
  api: {
    react: { label: 'label' },
  },
};
