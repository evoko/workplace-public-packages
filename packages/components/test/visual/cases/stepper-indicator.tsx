import oracle from '../../../../../spec/verify/stepper-indicator.json';
import {
  StepperIndicator,
  type StepperIndicatorProps,
} from '../../../src/StepperIndicator.js';
import type { VisualCase } from './types.js';

// Figma's number.
export default {
  oracle,
  render: (v) => (
    <StepperIndicator
      {...(v.props as Pick<StepperIndicatorProps, 'status'>)}
      number={1}
    />
  ),
} satisfies VisualCase;
