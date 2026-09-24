import oracle from '../../../../../spec/verify/number-input.json';
import {
  NumberInput,
  type NumberInputProps,
} from '../../../src/NumberInput.js';
import type { VisualCase } from './types.js';

// Figma's words, its label and helper, and its number, 0, by the stepper the variant draws.
export default {
  oracle,
  render: (v) => (
    <NumberInput
      {...(v.props as NumberInputProps)}
      label="Label"
      mandatory
      helper="Helper text"
      value={0}
      onChange={() => {}}
    />
  ),
} satisfies VisualCase;
