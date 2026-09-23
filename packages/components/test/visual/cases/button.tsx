import oracle from '../../../../../spec/verify/button.json';
import { Button, type ButtonProps } from '../../../src/Button.js';
import { counter, icon } from './probes.js';
import type { VisualCase } from './types.js';

// Both icons and a counter, so their colours are measured in every variant.
export default {
  oracle,
  render: (v) => (
    <Button
      {...(v.props as ButtonProps)}
      iconLeading={icon}
      iconTrailing={icon}
      counter={counter}
    >
      Label
    </Button>
  ),
} satisfies VisualCase;
