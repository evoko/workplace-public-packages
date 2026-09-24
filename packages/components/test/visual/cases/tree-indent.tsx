import oracle from '../../../../../spec/verify/tree-indent.json';
import { TreeIndent, type TreeIndentProps } from '../../../src/TreeIndent.js';
import type { VisualCase } from './types.js';

export default {
  oracle,
  render: (v) => <TreeIndent {...(v.props as TreeIndentProps)} />,
} satisfies VisualCase;
