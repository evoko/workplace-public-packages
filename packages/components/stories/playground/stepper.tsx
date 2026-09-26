/**
 * Stepper's Playground: two sample steps and the three its step toggles show, of its type; the
 * active one is the `activeStep` extra, kept within the steps shown (written back where a toggle
 * leaves it past the last). Under it, an app's Back and Next Buttons, the flow's (the Stepper has
 * none of its own), move it; a completed step goes back to it, as `onStepClick` lets an app; each is
 * set and logged.
 */

import { useEffect } from 'react';
import { Button } from '../../src/Button.js';
import { Stepper, type StepperProps } from '../../src/Stepper.js';
import { steps } from './samples.js';
import type { Playground, PlaygroundBuilder } from './types.js';

function StepperPlayground({ p }: { p: Playground }) {
  const toggles = ['step3', 'step4', 'step5'].map((s) => p.child(s).shown);
  const labels = steps.filter((_, i) => i < 2 || toggles[i - 2]);
  const last = labels.length - 1;
  const wanted = p.whole('activeStep');
  const active = Math.min(wanted, last);
  useEffect(() => {
    if (active !== wanted) p.set('activeStep', active);
    // `p` is rebuilt on every render; the step alone decides whether to write it back.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, wanted]);
  const go = (step: number, event: string, detail: unknown) => {
    p.set('activeStep', step);
    p.log(event, detail);
  };
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--solar-stack-md)',
      }}
    >
      <Stepper
        type={p.choice<NonNullable<StepperProps['type']>>('type')}
        steps={labels}
        activeStep={active}
        onStepClick={(i) => go(i, 'onStepClick', i)}
      />
      <div style={{ display: 'flex', gap: 'var(--solar-stack-xs)' }}>
        <Button
          size="sm"
          prio="secondary"
          disabled={active === 0}
          onClick={() => go(active - 1, 'onClick', 'Back')}
        >
          Back
        </Button>
        <Button
          size="sm"
          disabled={active === last}
          onClick={() => go(active + 1, 'onClick', 'Next')}
        >
          Next
        </Button>
      </div>
    </div>
  );
}

export default {
  render: (p) => <StepperPlayground p={p} />,
} satisfies PlaygroundBuilder;
