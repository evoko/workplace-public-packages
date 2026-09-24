import oracle from '../../../../../spec/verify/segmented-control.json';
import {
  SegmentedControl,
  type SegmentedControlProps,
} from '../../../src/SegmentedControl.js';
import {
  SegmentedControlItem,
  type SegmentedControlItemProps,
} from '../../../src/SegmentedControlItem.js';
import { icon } from './probes.js';
import type { OracleVariant, VisualCase } from './types.js';

type ChildLayer = { component?: string; variant?: Record<string, string> };

/** The segments Figma draws in the variant, in its order, each marked with its layer. */
const segments = (v: OracleVariant) =>
  Object.entries(v.layers as Record<string, ChildLayer>).filter(
    ([, l]) => l.component === 'Segmented Control Item',
  );

// Figma's segments with Figma's words, the one it draws selected chosen, and every slot filled so
// its look is measured: the label, starred, the helper, and both icons of every segment.
export default {
  oracle,
  render: (v) => (
    <SegmentedControl
      {...(v.props as Omit<
        SegmentedControlProps,
        'children' | 'value' | 'onChange'
      >)}
      value={
        segments(v).find(([, l]) => l.variant?.selected === 'true')?.[0] ?? null
      }
      onChange={() => {}}
      label="Label"
      mandatory
      helper="Helper text"
    >
      {segments(v).map(([name, l]) => (
        <SegmentedControlItem
          key={name}
          data-layer={name}
          value={name}
          size={l.variant?.size as SegmentedControlItemProps['size']}
          iconLeading={icon}
          iconTrailing={icon}
        >
          Label
        </SegmentedControlItem>
      ))}
    </SegmentedControl>
  ),
} satisfies VisualCase;
