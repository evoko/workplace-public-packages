import oracle from '../../../../../spec/verify/stepper.json';
import { Stepper, type StepperProps } from '../../../src/Stepper.js';
import type { VisualCase } from './types.js';

/** Figma's sample of each type: how many steps, and which is active. */
const SAMPLES: Record<string, [number, number]> = {
  'with label': [3, 1],
  'no label': [3, 1],
  line: [5, 0],
  'line+text': [5, 1],
};

// Figma's steps for each type, named "Step".
export default {
  oracle,
  render: (v) => {
    const { type } = v.props as Pick<StepperProps, 'type'>;
    const [n, active] = SAMPLES[type ?? 'with label'];
    return (
      <Stepper
        type={type}
        steps={Array.from({ length: n }, () => 'Step')}
        activeStep={active}
      />
    );
  },
} satisfies VisualCase;
