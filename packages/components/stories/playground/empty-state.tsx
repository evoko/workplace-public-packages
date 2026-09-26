/**
 * EmptyState's Playground: its icon, title and description from their controls, each cleared part
 * left out; its action a SOLAR Button, secondary at sm as the README composes it, shown by its
 * toggle with its words, its click logged.
 */

import { Button } from '../../src/Button.js';
import { EmptyState } from '../../src/EmptyState.js';
import type { PlaygroundBuilder } from './types.js';

export default {
  render: (p) => {
    const action = p.child('action');
    return (
      <EmptyState
        icon={p.icon('icon')}
        title={p.words('title')}
        description={p.words('description')}
        action={
          action.shown ? (
            <Button
              prio="secondary"
              size="sm"
              aria-label={action.text ? undefined : 'Label'}
              onClick={() => p.log('onClick')}
            >
              {action.text || undefined}
            </Button>
          ) : undefined
        }
      />
    );
  },
} satisfies PlaygroundBuilder;
