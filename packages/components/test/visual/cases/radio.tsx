import oracle from '../../../../../spec/verify/radio.json';
import { Radio } from '../../../src/Radio.js';
import type { VisualCase } from './types.js';

// Checked where Figma draws it so, by its prop: a RadioGroup around it would be the case's root,
// which the check measures (the shell's own test checks the group's value); named.
export default {
  oracle,
  render: (v) => (
    <Radio
      value="option"
      checked={Boolean(v.props.checked)}
      disabled={Boolean(v.props.disabled)}
      onChange={() => {}}
      slotProps={{ input: { 'aria-label': 'Option' } }}
    />
  ),
} satisfies VisualCase;
