/** Stepper Indicator's Playground: its status from its control, its number the `number` extra. */

import {
  StepperIndicator,
  type StepperIndicatorProps,
} from '../../src/StepperIndicator.js';
import type { PlaygroundBuilder } from './types.js';

export default {
  render: (p) => (
    <StepperIndicator
      status={p.choice<NonNullable<StepperIndicatorProps['status']>>('status')}
      number={p.whole('number')}
    />
  ),
} satisfies PlaygroundBuilder;
