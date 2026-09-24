import oracle from '../../../../../spec/verify/section-nav-item.json';
import {
  SectionNavItem,
  type SectionNavItemProps,
} from '../../../src/SectionNavItem.js';
import { icon } from './probes.js';
import type { VisualCase } from './types.js';

// Figma's label, and its icon a probe.
export default {
  oracle,
  render: (v) => (
    <SectionNavItem
      {...(v.props as Pick<SectionNavItemProps, 'selected' | 'disabled'>)}
      label="Label"
      icon={icon}
    />
  ),
} satisfies VisualCase;
