import oracle from '../../../../../spec/verify/breadcrumb-item.json';
import {
  BreadcrumbItem,
  type BreadcrumbItemProps,
} from '../../../src/BreadcrumbItem.js';
import type { VisualCase } from './types.js';

// Figma's words; a link, so its hover is reached as a user's is.
export default {
  oracle,
  render: (v) => (
    <BreadcrumbItem
      {...(v.props as Pick<BreadcrumbItemProps, 'type' | 'disabled'>)}
      href="#"
    >
      Label
    </BreadcrumbItem>
  ),
} satisfies VisualCase;
