/** PageNavButton's Playground: its direction and state from their controls; its click is logged. */

import {
  PageNavButton,
  type PageNavButtonProps,
} from '../../src/PageNavButton.js';
import type { PlaygroundBuilder } from './types.js';

export default {
  render: (p) => (
    <PageNavButton
      direction={p.choice<NonNullable<PageNavButtonProps['direction']>>(
        'direction',
      )}
      disabled={p.flag('disabled')}
      onClick={() => p.log('onClick')}
    />
  ),
} satisfies PlaygroundBuilder;
