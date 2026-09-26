/**
 * Insight Row's Playground: its words, severity and state from their controls; its action, shown by
 * the `action` toggle, a SOLAR Button, sm and secondary as Figma draws it, in Figma's words, its
 * click logged with the slot (`onClick: "action"`). Pressable, as an app's row is: its press is
 * logged.
 */

import { Button } from '../../src/Button.js';
import { InsightRow, type InsightRowProps } from '../../src/InsightRow.js';
import type { PlaygroundBuilder } from './types.js';

export default {
  render: (p) => (
    <InsightRow
      severity={p.choice<NonNullable<InsightRowProps['severity']>>('severity')}
      loading={p.flag('loading')}
      title={p.text('title')}
      meta={p.text('meta')}
      action={
        p.child('action').shown ? (
          <Button
            size="sm"
            prio="secondary"
            onClick={() => p.log('onClick', 'action')}
          >
            Label
          </Button>
        ) : undefined
      }
      onClick={() => p.log('onClick')}
    />
  ),
} satisfies PlaygroundBuilder;
