import oracle from '../../../../../spec/verify/paginationnav.json';
import {
  PaginationNav,
  type PaginationNavProps,
} from '../../../src/PaginationNav.js';
import type { VisualCase } from './types.js';

// The arrow in Figma's direction.
export default {
  oracle,
  render: (v) => (
    <PaginationNav
      {...(v.props as Pick<PaginationNavProps, 'direction' | 'disabled'>)}
    />
  ),
} satisfies VisualCase;
