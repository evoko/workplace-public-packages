/**
 * Toggle's Playground: selected and disabled from their controls; a click turns it on or off, which
 * the `selected` control follows. Named "Setting".
 */

import { Toggle } from '../../src/Toggle.js';
import type { PlaygroundBuilder } from './types.js';

export default {
  render: (p) => (
    <Toggle
      selected={p.flag('selected')}
      disabled={p.flag('disabled')}
      onChange={(_, selected) => {
        p.set('selected', selected);
        p.log('onChange', selected);
      }}
      slotProps={{ input: { 'aria-label': 'Setting' } }}
    />
  ),
} satisfies PlaygroundBuilder;
