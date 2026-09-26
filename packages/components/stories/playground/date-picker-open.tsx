/**
 * Date Picker Open's Playground: the calendar, in place; its look (`inline`, `type`) from its
 * controls. The day chosen is the `value` extra, `YYYY-MM-DD`, which picking a day sets; words that
 * are no date choose none (dates.ts). The IR's `month`, a month's English name and year (`April
 * 2026`, Figma's), is the month it opens on, opened again where the control changes; words that are
 * no month open it on the chosen day's month. Its arrows turn the month within the calendar and do
 * not reach `month`: the shell tells no one the month it shows.
 */

import {
  DatePickerOpen,
  type DatePickerOpenProps,
} from '../../src/DatePickerOpen.js';
import { isoDate, monthStart } from './dates.js';
import type { PlaygroundBuilder } from './types.js';

export default {
  render: (p) => {
    const month = monthStart(p.text('month')) ?? undefined;
    return (
      <DatePickerOpen
        // Opened afresh on the month the control names: the shell reads it only as it opens.
        key={month ?? ''}
        inline={p.flag('inline')}
        type={p.choice<NonNullable<DatePickerOpenProps['type']>>('type')}
        defaultMonth={month}
        value={isoDate(p.text('value'))}
        onChange={(date) => {
          p.set('value', date);
          p.log('onChange', date);
        }}
      />
    );
  },
} satisfies PlaygroundBuilder;
