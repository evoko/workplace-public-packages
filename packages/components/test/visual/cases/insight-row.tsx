import oracle from '../../../../../spec/verify/insight-row.json';
import { Button, type ButtonProps } from '../../../src/Button.js';
import { InsightRow, type InsightRowProps } from '../../../src/InsightRow.js';
import type { OracleVariant, VisualCase } from './types.js';

type ChildLayer = { variant?: Record<string, string> };

/** The Button Figma draws as the row's action, as the variant draws it. */
const action = (v: OracleVariant) => {
  const b = (v.layers as Record<string, ChildLayer>).action?.variant ?? {};
  return (
    <Button
      size={b.size as ButtonProps['size']}
      variant={b.prio as ButtonProps['variant']}
      danger={b.danger === 'true'}
    >
      Label
    </Button>
  );
};

// Figma's words and its Button, pressable so a hover is reached as a user reaches it; as wide as
// Figma draws it.
export default {
  oracle,
  render: (v) => (
    <InsightRow
      {...(v.props as Pick<InsightRowProps, 'severity' | 'loading'>)}
      title="Title"
      meta="Detail · Detail · Detail"
      action={action(v)}
      onClick={() => {}}
      style={{ width: 480 }}
    />
  ),
} satisfies VisualCase;
