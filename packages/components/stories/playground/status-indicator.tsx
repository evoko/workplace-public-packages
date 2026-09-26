/**
 * StatusIndicator's Playground: its type and size. Decorative, as beside the words that say the
 * status in an app.
 */

import {
  StatusIndicator,
  type StatusIndicatorProps,
} from '../../src/StatusIndicator.js';
import type { PlaygroundBuilder } from './types.js';

export default {
  render: (p) => (
    <StatusIndicator
      type={p.choice<NonNullable<StatusIndicatorProps['type']>>('type')}
      size={p.choice<NonNullable<StatusIndicatorProps['size']>>('size')}
    />
  ),
} satisfies PlaygroundBuilder;
