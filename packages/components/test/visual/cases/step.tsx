import oracle from '../../../../../spec/verify/step.json';
import { Step, type StepProps } from '../../../src/Step.js';
import type { VisualCase } from './types.js';

// Figma's words and number.
export default {
  oracle,
  render: (v) => (
    <Step
      {...(v.props as Pick<StepProps, 'status' | 'type'>)}
      label="Step"
      number={1}
    />
  ),
} satisfies VisualCase;
