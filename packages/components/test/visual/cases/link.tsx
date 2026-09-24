import oracle from '../../../../../spec/verify/link.json';
import { Link, type LinkProps } from '../../../src/Link.js';
import { icon } from './probes.js';
import type { VisualCase } from './types.js';

// Both icons, so their colours are measured in every variant, and Figma's own words.
export default {
  oracle,
  render: (v) => (
    <Link
      {...(v.props as Omit<LinkProps, 'children'>)}
      href="#"
      leadingIcon={icon}
      trailingIcon={icon}
    >
      Link text
    </Link>
  ),
} satisfies VisualCase;
