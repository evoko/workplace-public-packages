// The SOLAR controls a composing case draws where Figma composes them, as each one's own check
// measures it: shared by the cases of the components that hold them (TableHeader, PropertyRow, Calendar Toolbar).

import segmented from '../../../../../spec/verify/segmented-control.json';
import { SegmentedControl } from '../../../src/SegmentedControl.js';
import {
  SegmentedControlItem,
  type SegmentedControlItemProps,
} from '../../../src/SegmentedControlItem.js';
import type { OracleVariant } from './types.js';

type ChildLayer = { component?: string; variant?: Record<string, string> };

/** A Segmented Control's segments at a size, as its own oracle draws them: Figma's, in order. */
const segmentsOf = (size: 'md' | 'sm') =>
  Object.entries(
    (segmented.variants as OracleVariant[]).find(
      (s) => (s.props as { size?: string }).size === size,
    )!.layers as Record<string, ChildLayer>,
  ).filter(([, l]) => l.component === 'Segmented Control Item');

/**
 * A Segmented Control with no label or helper (as a composing instance hides them) and the six
 * segments its own check draws, each marked with its layer, the first chosen.
 */
export const segmentedControl = (size: 'md' | 'sm') => {
  const segments = segmentsOf(size);
  return (
    <SegmentedControl
      size={size}
      value={segments[0]![0]}
      onChange={() => {}}
      aria-label="View"
    >
      {segments.map(([name, l]) => (
        <SegmentedControlItem
          key={name}
          data-layer={name}
          value={name}
          size={l.variant?.size as SegmentedControlItemProps['size']}
        >
          Label
        </SegmentedControlItem>
      ))}
    </SegmentedControl>
  );
};

/** The md one, as TableHeader and PropertyRow compose it. */
export const segmentedControlMd = () => segmentedControl('md');
