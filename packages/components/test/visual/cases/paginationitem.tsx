import oracle from '../../../../../spec/verify/paginationitem.json';
import {
  PaginationItem,
  type PaginationItemProps,
} from '../../../src/PaginationItem.js';
import type { VisualCase } from './types.js';

// Figma's page number.
export default {
  oracle,
  render: (v) => (
    <PaginationItem
      {...(v.props as Pick<PaginationItemProps, 'selected' | 'disabled'>)}
    >
      1
    </PaginationItem>
  ),
} satisfies VisualCase;
