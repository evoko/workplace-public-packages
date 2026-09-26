/**
 * Option Card's Playground: its words and state from their controls. Pressing it makes it the
 * current one of its set, as an app's grid of tiles does: `selected` is set, and the press logged.
 */

import { OptionCard } from '../../src/OptionCard.js';
import type { PlaygroundBuilder } from './types.js';

export default {
  render: (p) => (
    <OptionCard
      selected={p.flag('selected')}
      label={p.text('label')}
      onClick={() => {
        p.set('selected', true);
        p.log('onClick');
      }}
    />
  ),
} satisfies PlaygroundBuilder;
