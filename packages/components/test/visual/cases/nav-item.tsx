import oracle from '../../../../../spec/verify/nav-item.json';
import { NavItem, type NavItemProps } from '../../../src/NavItem.js';
import { icon } from './probes.js';
import type { VisualCase } from './types.js';

// Figma's label, and its icon a probe, outlined and solid alike: which one shows is the shell's.
export default {
  oracle,
  render: (v) => (
    <NavItem
      {...(v.props as Pick<NavItemProps, 'selected' | 'expanded'>)}
      label="Label"
      iconOutline={icon}
      iconSolid={icon}
    />
  ),
} satisfies VisualCase;
