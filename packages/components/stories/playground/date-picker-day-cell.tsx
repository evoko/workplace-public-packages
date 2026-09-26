/**
 * Date Picker Day Cell's Playground: a day is a cell of its calendar's grid, so it is drawn in a
 * grid's row of its own, named by its whole date (a sample April 2026 one). Its words, states and
 * range role from their controls. A click chooses it, as the calendar's day is chosen: it is
 * logged, and sets `selected`. Disabled, it is inert.
 */

import {
  DatePickerDayCell,
  type DatePickerDayCellProps,
} from '../../src/DatePickerDayCell.js';
import type { PlaygroundBuilder } from './types.js';

export default {
  render: (p) => {
    const day = p.text('day');
    return (
      <div role="grid" aria-label="April 2026">
        <div role="row" style={{ display: 'inline-flex' }}>
          <DatePickerDayCell
            aria-label={`${day} April 2026`}
            tabIndex={0}
            selected={p.flag('selected')}
            today={p.flag('today')}
            disabled={p.flag('disabled')}
            filled={p.flag('filled')}
            error={p.flag('error')}
            rangeRole={p.choice<
              NonNullable<DatePickerDayCellProps['rangeRole']>
            >('rangeRole')}
            onClick={() => {
              p.set('selected', true);
              p.log('onClick', day);
            }}
          >
            {day}
          </DatePickerDayCell>
        </div>
      </div>
    );
  },
} satisfies PlaygroundBuilder;
