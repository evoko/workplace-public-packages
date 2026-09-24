import oracle from '../../../../../spec/verify/segmented-control-item.json';
import {
  SegmentedControlItem,
  type SegmentedControlItemProps,
} from '../../../src/SegmentedControlItem.js';
import { icon } from './probes.js';
import type { VisualCase } from './types.js';

// Selected where Figma draws it so, by its prop: a SegmentedControl around it would be the case's
// root, which the check measures. Both icons, so their colours are measured, and Figma's words.
export default {
  oracle,
  render: (v) => (
    <SegmentedControlItem
      {...(v.props as Omit<SegmentedControlItemProps, 'value' | 'children'>)}
      value="option"
      onChange={() => {}}
      iconLeading={icon}
      iconTrailing={icon}
    >
      Label
    </SegmentedControlItem>
  ),
} satisfies VisualCase;
