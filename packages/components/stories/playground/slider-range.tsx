/**
 * Slider Range's Playground: disabled from its control; its two ends the `low` and `high` extras in
 * percent (the shell takes 0 to 100), which dragging a handle or an arrow key sets, and which a
 * drag's end reports too. Where the panel puts `low` above `high`, the range is drawn from the
 * lower to the higher. Its handles are named "Minimum" and "Maximum". It fills its container, the
 * width box.
 */

import { SliderRange } from '../../src/SliderRange.js';
import type { PlaygroundBuilder } from './types.js';

export default {
  render: (p) => {
    const low = p.whole('low');
    const high = p.whole('high');
    return (
      <SliderRange
        disabled={p.flag('disabled')}
        value={[Math.min(low, high), Math.max(low, high)]}
        onChange={(_, [from, to]) => {
          p.set('low', from);
          p.set('high', to);
          p.log('onChange', [from, to]);
        }}
        onChangeCommitted={(_, value) => p.log('onChangeCommitted', value)}
        getAriaLabel={(i) => (i === 0 ? 'Minimum' : 'Maximum')}
      />
    );
  },
} satisfies PlaygroundBuilder;
