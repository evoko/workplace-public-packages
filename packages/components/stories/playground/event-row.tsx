/**
 * Event Row's Playground: its words from their controls; who did it, shown by the `leading` toggle,
 * a sample person's SOLAR Avatar, md. Its More control stands for the More menu, since the shell
 * draws its own icon: `_none` hides it, else it offers the sample actions (cards.ts). Pressable, as
 * an app's feed row is: its press is logged.
 */

import { Avatar } from '../../src/Avatar.js';
import { EventRow } from '../../src/EventRow.js';
import { moreItemsOf } from './cards.js';
import type { PlaygroundBuilder } from './types.js';

export default {
  render: (p) => (
    <EventRow
      leading={
        p.child('leading').shown ? (
          <Avatar size="md" type="text" name="Dana Scully" />
        ) : undefined
      }
      title={p.text('title')}
      product={p.text('productTag')}
      meta={p.text('metaText')}
      timestamp={p.text('timestamp')}
      moreItems={p.icon('more') ? moreItemsOf(p) : undefined}
      onClick={() => p.log('onClick')}
    />
  ),
} satisfies PlaygroundBuilder;
