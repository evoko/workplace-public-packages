/**
 * SOLAR Interactive Card, beyond its IR: where MUI draws each layer and marks each state. Its
 * shells are files of their own, written by hand. One file per component, so adding one edits
 * nothing shared; `src/components/index.mjs` finds them.
 *
 * A selectable row card of the family (`src/components/shared/card.mjs`): a drag handle, one control that
 * selects it (a Checkbox, a Radio or a Toggle, the caller's choice), its headline and
 * description, and the caller's actions; pressable where it is given something to do, and drawn
 * as it is dragged.
 */

import { cardResets, cardStates } from './shared/card.mjs';

export default {
  name: 'Interactive Card',
  mui: {
    // The shell draws every layer itself, each with a class of its own (shared/card.mjs).
    slots: 'drawn',
    resets: cardResets('Interactive Card', {
      wrap: ['title', 'description'],
      icons: ['icon'],
      fixed: ['dragHandle', 'toggle', 'radioButton', 'checkbox', 'actions'],
    }),
    states: cardStates('Interactive Card', { selected: true }),
    overlaps: { focus: ['hover', 'selected'], hover: ['selected'] },
  },
  flutter: {},
  // How each platform reaches what the IR names, where not by its own name (src/shells/api.mjs).
  api: {
    react: {
      toggle: 'control',
      radioButton: 'control',
      checkbox: 'control',
    },
    flutter: {
      toggle: 'control',
      radioButton: 'control',
      checkbox: 'control',
    },
  },
};
