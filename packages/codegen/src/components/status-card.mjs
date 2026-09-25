/**
 * SOLAR Status Card, beyond its IR: where MUI draws each layer and marks each state. Its shells are
 * files of their own, written by hand. One file per component, so adding one edits nothing shared;
 * `src/components/index.mjs` finds them.
 *
 * A card of the family (`src/components/shared/card.mjs`): a title and a More menu over a figure and the
 * StatusIndicator of its status, pressable where it is given something to do, and its
 * placeholders while it loads.
 */

import { cardResets, cardStates } from './shared/card.mjs';

export default {
  name: 'Status Card',
  mui: {
    // The shell draws every layer itself, each with a class of its own (shared/card.mjs).
    slots: 'drawn',
    resets: cardResets('Status Card', { more: 'iconMore' }),
    states: cardStates('Status Card'),
    overlaps: { focus: ['hover'] },
  },
  flutter: {},
};
