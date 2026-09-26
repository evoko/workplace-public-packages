/**
 * Agenda Row's Playground: its state, density, category and words from their controls, a cleared
 * one left out (the comfortable row draws `start` and `end`, the compact one `range`); its
 * attendee, shown by the `attendee` toggle, an md Avatar with a sample name. Pressable, as an app's
 * agenda is: a press shows the event, making it the selected one (`selected` set), and is logged.
 */

import { AgendaRow, type AgendaRowProps } from '../../src/AgendaRow.js';
import { Avatar } from '../../src/Avatar.js';
import type { PlaygroundBuilder } from './types.js';

export default {
  render: (p) => (
    <AgendaRow
      selected={p.flag('selected')}
      density={p.choice<NonNullable<AgendaRowProps['density']>>('density')}
      category={p.choice<NonNullable<AgendaRowProps['category']>>('category')}
      title={p.text('title')}
      start={p.words('start')}
      end={p.words('end')}
      range={p.words('range')}
      meta={p.words('meta')}
      attendee={
        p.child('attendee').shown ? (
          <Avatar size="md" type="text" name="Dana Scully" />
        ) : undefined
      }
      onClick={() => {
        p.set('selected', true);
        p.log('onClick');
      }}
    />
  ),
} satisfies PlaygroundBuilder;
