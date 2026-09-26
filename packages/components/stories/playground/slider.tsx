/**
 * Slider's Playground: disabled, filled and error from their controls; its value the `value` extra
 * in percent (the shell takes 0 to 100), which dragging the handle or an arrow key sets, and which
 * a drag's end reports too. Named "Volume". It fills its container, the width box.
 */

import { Slider } from '../../src/Slider.js';
import type { PlaygroundBuilder } from './types.js';

export default {
  render: (p) => (
    <Slider
      disabled={p.flag('disabled')}
      filled={p.flag('filled')}
      error={p.flag('error')}
      value={p.whole('value')}
      onChange={(_, value) => {
        p.set('value', value);
        p.log('onChange', value);
      }}
      onChangeCommitted={(_, value) => p.log('onChangeCommitted', value)}
      aria-label="Volume"
    />
  ),
} satisfies PlaygroundBuilder;
