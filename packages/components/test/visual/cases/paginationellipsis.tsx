import oracle from '../../../../../spec/verify/paginationellipsis.json';
import { PaginationEllipsis } from '../../../src/PaginationEllipsis.js';
import type { VisualCase } from './types.js';

// The ellipsis, as drawn.
export default {
  oracle,
  render: () => <PaginationEllipsis />,
} satisfies VisualCase;
