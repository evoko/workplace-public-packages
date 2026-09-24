import oracle from '../../../../../spec/verify/counter.json';
import { Counter, type CounterProps } from '../../../src/Counter.js';
import type { VisualCase } from './types.js';

// Given onClick, so it is a control of its own, which the spec hovers and presses.
export default {
  oracle,
  render: (v) => (
    <Counter
      {...(v.props as Omit<CounterProps, 'count'>)}
      count={3}
      onClick={() => {}}
    />
  ),
} satisfies VisualCase;
