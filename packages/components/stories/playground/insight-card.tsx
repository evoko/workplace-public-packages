/**
 * Insight Card's Playground: its words, severity and states from their controls, a cleared
 * description left out; its More menu the sample actions (cards.ts). Pressing it makes it the
 * current one of its set, as an app's list of insights does: `selected` is set, and the press
 * logged.
 */

import { InsightCard, type InsightCardProps } from '../../src/InsightCard.js';
import { moreItemsOf } from './cards.js';
import type { PlaygroundBuilder } from './types.js';

export default {
  render: (p) => (
    <InsightCard
      severity={p.choice<NonNullable<InsightCardProps['severity']>>('severity')}
      selected={p.flag('selected')}
      loading={p.flag('loading')}
      title={p.text('title')}
      description={p.words('description')}
      moreItems={moreItemsOf(p)}
      onClick={() => {
        p.set('selected', true);
        p.log('onClick');
      }}
    />
  ),
} satisfies PlaygroundBuilder;
