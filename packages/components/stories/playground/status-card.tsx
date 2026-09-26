/**
 * Status Card's Playground: its words, status and states from their controls; its More menu the
 * sample actions (cards.ts). Pressable, as an app's card is: its press is logged.
 */

import { StatusCard, type StatusCardProps } from '../../src/StatusCard.js';
import { moreItemsOf } from './cards.js';
import type { PlaygroundBuilder } from './types.js';

export default {
  render: (p) => (
    <StatusCard
      status={p.choice<NonNullable<StatusCardProps['status']>>('status')}
      disabled={p.flag('disabled')}
      loading={p.flag('loading')}
      title={p.text('title')}
      value={p.text('value')}
      moreItems={moreItemsOf(p)}
      onClick={() => p.log('onClick')}
    />
  ),
} satisfies PlaygroundBuilder;
