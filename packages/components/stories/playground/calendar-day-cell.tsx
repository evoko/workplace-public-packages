/**
 * Calendar Day Cell's Playground: a day is a cell of its month's grid, so it is drawn in a grid's
 * row of its own, named by its whole date (a sample October 2026 one). Its day and states from their
 * controls; its events, three sample Event Chips (samples.ts), shown by the `events` toggle. A styled
 * part: which day is selected is the app's, from the `selected` control.
 */

import { CalendarDayCell } from '../../src/CalendarDayCell.js';
import { EventChip } from '../../src/EventChip.js';
import { events } from './samples.js';
import type { PlaygroundBuilder } from './types.js';

export default {
  render: (p) => {
    const day = p.text('day');
    return (
      <div role="grid" aria-label="October 2026">
        <div role="row">
          <CalendarDayCell
            day={day}
            label={`${day} October 2026`}
            otherMonth={p.flag('otherMonth')}
            selected={p.flag('selected')}
            today={p.flag('today')}
            todayColumn={p.flag('todayColumn')}
          >
            {p.flag('events')
              ? events.map(([title, time, category]) => (
                  <EventChip
                    key={title}
                    category={category}
                    time={time}
                    title={title}
                  />
                ))
              : null}
          </CalendarDayCell>
        </div>
      </div>
    );
  },
} satisfies PlaygroundBuilder;
