/**
 * SOLAR Divider, beyond its IR: where MUI draws each layer. Its shells are files of their own,
 * written by hand. One file per component, so adding one edits nothing shared;
 * `src/components/index.mjs` finds them.
 *
 * A drawn component (`src/components/shared/drawn.mjs`): a rule, or a label between two rules, as layers of
 * their own. Its root is a block, as a separator spans its container.
 */

import { drawnResets } from './shared/drawn.mjs';

export default {
  name: 'Divider',
  mui: {
    // The shell draws every layer itself, each with a class of its own.
    slots: 'drawn',
    // A block, where the other drawn components are inline: a separator spans what it separates.
    resets: drawnResets('Divider', { display: 'flex' }),
  },
  flutter: {},
};
