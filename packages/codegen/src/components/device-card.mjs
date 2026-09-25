/**
 * SOLAR Device Card, beyond its IR: where MUI draws each layer and marks each state. Its shells are
 * files of their own, written by hand. One file per component, so adding one edits nothing shared;
 * `src/components/index.mjs` finds them.
 *
 * A card of the family (`src/components/shared/card.mjs`): one device (its icon, name, details and health)
 * or a batch of them (its headline over the caller's Dropdown of its devices), each drawn from its
 * own layers as Figma draws each; its health a SOLAR Tag, its action the caller's Button, and its
 * placeholders while it loads.
 */

import { cardResets, cardStates } from './shared/card.mjs';

const P = 'SolarDeviceCard';

export default {
  name: 'Device Card',
  mui: {
    // The shell draws every layer itself, each with a class of its own (shared/card.mjs).
    slots: 'drawn',
    resets: cardResets('Device Card', {
      wrap: ['details'],
      fixed: ['icon', 'headlineIcon', 'tag', 'headlineTag', 'button'],
      extra: { [`& .${P}-devices > *`]: { width: '100%' } },
    }),
    states: cardStates('Device Card', { loading: true }),
    overlaps: { focus: ['hover'] },
  },
  flutter: {},
  // How each platform reaches what the IR names, where not by its own name (src/shells/api.mjs).
  api: {
    react: { button: 'action' },
    flutter: { button: 'action' },
  },
};
