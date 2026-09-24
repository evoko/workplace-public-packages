import oracle from '../../../../../spec/verify/pagination.json';
import { Pagination } from '../../../src/Pagination.js';
import type { VisualCase } from './types.js';

// Figma's pages: the first of twelve, drawn 1 2 3 … 12.
export default {
  oracle,
  render: () => <Pagination count={12} page={1} onChange={() => {}} />,
} satisfies VisualCase;
