/**
 * SOLAR Insight Row, beyond its IR: where MUI draws each layer and marks each state. Its shells are
 * files of their own, written by hand. One file per component, so adding one edits nothing shared;
 * `src/components/index.mjs` finds them.
 *
 * A card of the family (`src/components/shared/card.mjs`): its severity's bar, named by its word, its title
 * and meta on a line each, and the caller's action (a Button); pressable where it is given
 * something to do, and its placeholders while it loads.
 */

import { cardResets, cardStates } from './shared/card.mjs';

const P = 'SolarInsightRow';

export default {
  name: 'Insight Row',
  mui: {
    // The shell draws every layer itself, each with a class of its own (shared/card.mjs). Its
    // words run on one line, cut short where they run out of room.
    slots: 'drawn',
    resets: cardResets('Insight Row', {
      fixed: ['severityBar'],
      extra: {
        [`& .${P}-title, & .${P}-meta`]: {
          minWidth: '0',
          maxWidth: '100%',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        },
        [`& .${P}--body`]: { minWidth: '0' },
        [`& .${P}-action`]: { flexShrink: '0' },
      },
    }),
    states: cardStates('Insight Row'),
    overlaps: { focus: ['hover'] },
  },
  flutter: {},
};
