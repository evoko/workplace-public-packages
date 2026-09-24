import oracle from '../../../../../spec/verify/checkbox.json';
import { Checkbox, type CheckboxProps } from '../../../src/Checkbox.js';
import type { VisualCase } from './types.js';

// Named, as a checkbox always is; controlled, so the variant's box is drawn whatever is clicked.
export default {
  oracle,
  render: (v) => (
    <Checkbox
      {...(v.props as CheckboxProps)}
      onChange={() => {}}
      slotProps={{ input: { 'aria-label': 'Option' } }}
    />
  ),
} satisfies VisualCase;
