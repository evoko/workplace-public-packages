/**
 * Step's Playground: a step works only in its Stepper, which makes its Steps and gives each its
 * status, so it is drawn second of three in a Stepper, its words the `label` extra, its siblings
 * sample steps. Its `status` places the Stepper's active (and error) step so that this one has it;
 * its `type` picks the Stepper that draws it (round Steps `with label`, horizontal ones
 * `line+text`). A completed step goes back to it, as `onStepClick` lets an app: this one's status
 * follows (active, or upcoming where the first is chosen), set and logged.
 */

import { Stepper } from '../../src/Stepper.js';
import type { PlaygroundBuilder } from './types.js';

type Status = 'error' | 'complete' | 'active' | 'upcoming';

/** The Stepper's active step, and its error step, that give the second step each status. */
const PLACED: Record<Status, [number, number | undefined]> = {
  upcoming: [0, undefined],
  active: [1, undefined],
  complete: [2, undefined],
  error: [1, 1],
};

export default {
  render: (p) => {
    const [active, error] = PLACED[p.choice<Status>('status')];
    return (
      <Stepper
        type={p.choice('type') === 'round' ? 'with label' : 'line+text'}
        steps={['Account', p.text('label'), 'Confirm']}
        activeStep={active}
        errorStep={error}
        onStepClick={(i) => {
          p.set('status', i === 0 ? 'upcoming' : 'active');
          p.log('onStepClick', i);
        }}
      />
    );
  },
} satisfies PlaygroundBuilder;
