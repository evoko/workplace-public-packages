/**
 * Split Dropdown's Playground: each zone's content a neutral placeholder, a SOLAR Skeleton, shown by
 * its toggle (`topContent`, `lowerContent`). Nothing in it is interactive: each zone is the caller's.
 */

import { Skeleton } from '../../src/Skeleton.js';
import { SplitDropdown } from '../../src/SplitDropdown.js';
import type { PlaygroundBuilder } from './types.js';

export default {
  render: (p) => (
    <SplitDropdown
      top={p.flag('topContent') ? <Skeleton /> : undefined}
      lower={p.flag('lowerContent') ? <Skeleton /> : undefined}
    />
  ),
} satisfies PlaygroundBuilder;
