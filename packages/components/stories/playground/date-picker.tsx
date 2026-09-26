/**
 * DatePicker's Playground: its date the IR's `value`, `YYYY-MM-DD` (Figma's own words are one), which
 * typing a date or picking a day sets, and clearing the words empties; words that are no date give
 * no date (dates.ts), not a failure. The field writes the date in the page's figures. Its label,
 * helper, size and states from their controls, a cleared label or helper left out; mandatory while
 * `required` holds any text. Its calendar's opening and closing are logged.
 */

import { DatePicker, type DatePickerProps } from '../../src/DatePicker.js';
import { isoDate } from './dates.js';
import type { PlaygroundBuilder } from './types.js';

export default {
  render: (p) => {
    const label = p.words('label');
    return (
      <DatePicker
        size={p.choice<NonNullable<DatePickerProps['size']>>('size')}
        disabled={p.flag('disabled')}
        error={p.flag('error')}
        label={label}
        mandatory={p.words('required') !== undefined}
        helper={p.words('helper')}
        value={isoDate(p.text('value'))}
        onChange={(date) => {
          p.set('value', date ?? '');
          p.log('onChange', date);
        }}
        onOpen={() => p.log('onOpen')}
        onClose={() => p.log('onClose')}
        inputProps={label ? undefined : { 'aria-label': 'Select Date' }}
      />
    );
  },
} satisfies PlaygroundBuilder;
