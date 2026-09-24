import oracle from '../../../../../spec/verify/options-list.json';
import { OptionRow, type OptionRowProps } from '../../../src/OptionRow.js';
import { OptionsList } from '../../../src/OptionsList.js';
import type { OracleVariant, VisualCase } from './types.js';

type ChildLayer = { component?: string; variant?: Record<string, string> };

/** The rows Figma draws in the variant, in its order, each with its layer. */
const rows = (v: OracleVariant) =>
  Object.entries(v.layers as Record<string, ChildLayer>).filter(
    ([, l]) => l.component === 'Option Row',
  );

// Figma's rows, in the control Figma draws, off, each with its words and the second line.
export default {
  oracle,
  render: (v) => (
    <OptionsList label="Options">
      {rows(v).map(([name, l]) => (
        <OptionRow
          key={name}
          data-layer={name}
          control={l.variant?.control as OptionRowProps['control']}
          checked={false}
          onChange={() => {}}
          supportingText="Supporting text"
        >
          Label
        </OptionRow>
      ))}
    </OptionsList>
  ),
} satisfies VisualCase;
