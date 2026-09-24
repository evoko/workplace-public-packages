import oracle from '../../../../../spec/verify/option-row.json';
import { OptionRow, type OptionRowProps } from '../../../src/OptionRow.js';
import type { VisualCase } from './types.js';

// Each control as Figma draws it, off, with its words and the second line, controlled so the
// variant's look is drawn whatever is clicked.
export default {
  oracle,
  render: (v) => (
    <OptionRow
      {...(v.props as Pick<OptionRowProps, 'control'>)}
      checked={false}
      onChange={() => {}}
      value="option"
      supportingText="Supporting text"
    >
      Label
    </OptionRow>
  ),
} satisfies VisualCase;
