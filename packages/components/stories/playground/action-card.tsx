/**
 * Action Card's Playground: its words, icon and status from their controls; its content, the
 * `description` words, shown by the `content` toggle (a cleared description left out). Its calls to
 * action, shown by the `cta` toggle, are SOLAR Buttons, sm, as Figma draws them, each shown by its
 * own toggle in its words: the primary a secondary once `done` and a danger primary in `danger`, as
 * Figma draws it; the shell keeps the primary alone in either. Their clicks are logged with the slot
 * (`onClick: "primaryCTA"`); its More menu offers the sample actions (cards.ts). Pressable, as an
 * app's card is: its press is logged.
 */

import { ActionCard, type ActionCardProps } from '../../src/ActionCard.js';
import { Button } from '../../src/Button.js';
import { moreItemsOf } from './cards.js';
import type { PlaygroundBuilder } from './types.js';

export default {
  render: (p) => {
    const status = p.choice<NonNullable<ActionCardProps['status']>>('status');
    const cta = p.child('cta').shown;
    const primary = p.child('primaryCTA');
    const secondary = p.child('secondaryCTA');
    const description = p.words('description');
    return (
      <ActionCard
        status={status}
        icon={p.icon('icon')}
        title={p.text('title')}
        description={p.flag('content') ? description : undefined}
        primaryAction={
          cta && primary.shown ? (
            <Button
              size="sm"
              prio={status === 'done' ? 'secondary' : 'primary'}
              danger={status === 'danger'}
              onClick={() => p.log('onClick', 'primaryCTA')}
            >
              {primary.text}
            </Button>
          ) : undefined
        }
        secondaryAction={
          cta && secondary.shown ? (
            <Button
              size="sm"
              prio="secondary"
              onClick={() => p.log('onClick', 'secondaryCTA')}
            >
              {secondary.text}
            </Button>
          ) : undefined
        }
        moreItems={moreItemsOf(p)}
        onClick={() => p.log('onClick')}
      />
    );
  },
} satisfies PlaygroundBuilder;
