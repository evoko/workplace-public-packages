/**
 * Checkbox's Playground: checked, mixed and disabled from their controls; a click checks it or
 * clears it, which the `checked` control follows, and ends a mixed state. Named "Option".
 */

import { Checkbox } from '../../src/Checkbox.js';
import type { PlaygroundBuilder } from './types.js';

export default {
  render: (p) => (
    <Checkbox
      checked={p.flag('checked')}
      mixed={p.flag('mixed')}
      disabled={p.flag('disabled')}
      onChange={(_, checked) => {
        p.set('checked', checked);
        p.set('mixed', false);
        p.log('onChange', checked);
      }}
      slotProps={{ input: { 'aria-label': 'Option' } }}
    />
  ),
} satisfies PlaygroundBuilder;
