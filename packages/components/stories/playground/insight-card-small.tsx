/**
 * Insight Card Small's Playground: its words, severity and state from their controls, a cleared
 * description left out. Pressable, as an app's card is: its press is logged.
 */

import {
  InsightCardSmall,
  type InsightCardSmallProps,
} from '../../src/InsightCardSmall.js';
import type { PlaygroundBuilder } from './types.js';

export default {
  render: (p) => (
    <InsightCardSmall
      severity={p.choice<NonNullable<InsightCardSmallProps['severity']>>(
        'severity',
      )}
      loading={p.flag('loading')}
      title={p.text('title')}
      description={p.words('description')}
      onClick={() => p.log('onClick')}
    />
  ),
} satisfies PlaygroundBuilder;
