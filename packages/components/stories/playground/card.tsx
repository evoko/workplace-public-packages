/**
 * Card's Playground: its words, icon, status and states from their controls, a cleared helper left
 * out; its Tag the `tag label` words, shown by the `tag` toggle; its content a neutral placeholder,
 * a SOLAR Skeleton, shown by the `content` toggle. Its More control stands for the More menu, since
 * the shell draws its own icon: `_none` hides it, else it offers the sample actions (cards.ts).
 * Pressable, as an app's card is: its press is logged.
 */

import { Card, type CardProps } from '../../src/Card.js';
import { Skeleton } from '../../src/Skeleton.js';
import { moreItemsOf } from './cards.js';
import type { PlaygroundBuilder } from './types.js';

export default {
  render: (p) => {
    const tag = p.child('tag');
    return (
      <Card
        disabled={p.flag('disabled')}
        status={p.choice<NonNullable<CardProps['status']>>('status')}
        loading={p.flag('loading')}
        title={p.text('title')}
        icon={p.icon('icon')}
        helper={p.words('helper')}
        tag={tag.shown && tag.text ? tag.text : undefined}
        moreItems={p.icon('more') ? moreItemsOf(p) : undefined}
        onClick={() => p.log('onClick')}
      >
        {p.flag('content') ? <Skeleton /> : undefined}
      </Card>
    );
  },
} satisfies PlaygroundBuilder;
