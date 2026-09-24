import oracle from '../../../../../spec/verify/cursor.json';
import { Cursor, type CursorProps } from '../../../src/Cursor.js';
import type { VisualCase } from './types.js';

export default {
  oracle,
  render: (v) => <Cursor {...(v.props as CursorProps)} />,
} satisfies VisualCase;
