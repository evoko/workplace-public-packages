import oracle from '../../../../../spec/verify/button.json';
import { Button, type ButtonProps } from '../../../src/Button.js';
import { Counter, type CounterProps } from '../../../src/Counter.js';
import { icon } from './probes.js';
import type { VisualCase } from './types.js';

// Both icons and a counter, so their colours are measured in every variant: a SOLAR Counter of the
// type Figma draws in this variant, which takes the button's states.
export default {
  oracle,
  render: (v) => (
    <Button
      {...(v.props as ButtonProps)}
      iconLeading={icon}
      iconTrailing={icon}
      counter={
        <Counter
          type={
            (v.layers?.counter?.variant?.type ??
              'regular') as CounterProps['type']
          }
          count={3}
        />
      }
    >
      Label
    </Button>
  ),
} satisfies VisualCase;
