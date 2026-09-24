import oracle from '../../../../../spec/verify/node-end.json';
import { NodeEnd, type NodeEndProps } from '../../../src/NodeEnd.js';
import type { VisualCase } from './types.js';

export default {
  oracle,
  render: (v) => <NodeEnd {...(v.props as NodeEndProps)} />,
} satisfies VisualCase;
