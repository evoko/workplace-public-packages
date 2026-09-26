/** PaginationNav's Playground: its direction and state from their controls; its click is logged. */

import {
  PaginationNav,
  type PaginationNavProps,
} from '../../src/PaginationNav.js';
import type { PlaygroundBuilder } from './types.js';

export default {
  render: (p) => (
    <PaginationNav
      direction={p.choice<NonNullable<PaginationNavProps['direction']>>(
        'direction',
      )}
      disabled={p.flag('disabled')}
      onClick={() => p.log('onClick')}
    />
  ),
} satisfies PlaygroundBuilder;
