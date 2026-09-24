import oracle from '../../../../../spec/verify/draghandle.json';
import { DragHandle, type DragHandleProps } from '../../../src/DragHandle.js';
import type { VisualCase } from './types.js';

// As a list would show it, named by default.
export default {
  oracle,
  render: (v) => <DragHandle {...(v.props as DragHandleProps)} />,
} satisfies VisualCase;
