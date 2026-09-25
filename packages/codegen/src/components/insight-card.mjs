/**
 * SOLAR Insight Card, beyond its IR: where MUI draws each layer and marks each state. Its shells
 * are files of their own, written by hand. One file per component, so adding one edits nothing
 * shared; `src/components/index.mjs` finds them.
 *
 * A card of the family (`src/components/shared/card.mjs`): the StatusIndicator of its severity in a tile, a
 * title and a description, and a More menu; selectable, pressable where it is given something to
 * do, and its placeholders while it loads.
 */

import { cardResets, cardStates } from './shared/card.mjs';

export default {
  name: 'Insight Card',
  mui: {
    // The shell draws every layer itself, each with a class of its own (shared/card.mjs).
    slots: 'drawn',
    resets: cardResets('Insight Card', {
      wrap: ['title', 'description'],
      more: 'iconMore',
      fixed: ['icon'],
    }),
    states: cardStates('Insight Card', { selected: true }),
    overlaps: { focus: ['hover', 'selected'], hover: ['selected'] },
  },
  flutter: {},
};
