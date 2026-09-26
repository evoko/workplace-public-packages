/** Tree Indent's Playground: its depth, a row of that many units of indent. */

import { TreeIndent, type TreeIndentProps } from '../../src/TreeIndent.js';
import type { PlaygroundBuilder } from './types.js';

export default {
  render: (p) => (
    <TreeIndent
      depth={p.choice<NonNullable<TreeIndentProps['depth']>>('depth')}
    />
  ),
} satisfies PlaygroundBuilder;
