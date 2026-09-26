/**
 * Trend Badge's Playground: its type and size. Decorative, as beside the words that say the change
 * in an app.
 */

import { TrendBadge, type TrendBadgeProps } from '../../src/TrendBadge.js';
import type { PlaygroundBuilder } from './types.js';

export default {
  render: (p) => (
    <TrendBadge
      type={p.choice<NonNullable<TrendBadgeProps['type']>>('type')}
      size={p.choice<NonNullable<TrendBadgeProps['size']>>('size')}
    />
  ),
} satisfies PlaygroundBuilder;
