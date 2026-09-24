import oracle from '../../../../../spec/verify/rowexpand.json';
import { RowExpand, type RowExpandProps } from '../../../src/RowExpand.js';
import type { VisualCase } from './types.js';

export default {
  oracle,
  render: (v) => <RowExpand {...(v.props as RowExpandProps)} />,
} satisfies VisualCase;
