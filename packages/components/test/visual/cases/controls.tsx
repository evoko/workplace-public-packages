// The SOLAR controls a composing case draws where Figma composes them, as each one's own check
// measures it: shared by the cases of the components that hold them (TableHeader, PropertyRow).

import segmented from '../../../../../spec/verify/segmented-control.json';
import { SegmentedControl } from '../../../src/SegmentedControl.js';
import {
  SegmentedControlItem,
  type SegmentedControlItemProps,
} from '../../../src/SegmentedControlItem.js';
import type { OracleVariant } from './types.js';

type ChildLayer = { component?: string; variant?: Record<string, string> };

/** The md Segmented Control's segments, as its own oracle draws them: Figma's, in order. */
const segments = Object.entries(
  (segmented.variants as OracleVariant[]).find(
    (s) => (s.props as { size?: string }).size === 'md',
  )!.layers as Record<string, ChildLayer>,
).filter(([, l]) => l.component === 'Segmented Control Item');

/**
 * An md Segmented Control with no label or helper (as a composing instance hides them) and the six
 * segments its own check draws, each marked with its layer, the first chosen.
 */
export const segmentedControlMd = () => (
  <SegmentedControl
    size="md"
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
