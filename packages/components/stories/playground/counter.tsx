/**
 * Counter's Playground: the `count` extra (at 0 it draws nothing, as SOLAR says; above 99 it reads
 * `99+`), its type and disabled state. Given its click callback, which is logged, it is a control of
 * its own, so it shows its own states.
 */

import { Counter, type CounterProps } from '../../src/Counter.js';
import type { PlaygroundBuilder } from './types.js';

export default {
  render: (p) => (
    <Counter
      type={p.choice<NonNullable<CounterProps['type']>>('type')}
      disabled={p.flag('disabled')}
      count={p.whole('count')}
      onClick={() => p.log('onClick')}
    />
  ),
} satisfies PlaygroundBuilder;
