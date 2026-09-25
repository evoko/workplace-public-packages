import oracle from '../../../../../spec/verify/rowselect.json';
import { RowSelect, type RowSelectProps } from '../../../src/RowSelect.js';
import type { VisualCase } from './types.js';

// The header row's cell and a row's, each unchecked as Figma draws them.
export default {
  oracle,
  render: (v) => (
    <RowSelect
      {...(v.props as Pick<RowSelectProps, 'header'>)}
      checked={false}
      onChange={() => {}}
    />
  ),
} satisfies VisualCase;
