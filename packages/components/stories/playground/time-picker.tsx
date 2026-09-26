/**
 * TimePicker's Playground: its time the IR's `value`, which typing a time or picking one sets, as
 * `HH:MM` on the 24-hour clock, and clearing the words empties; the control also reads Figma's
 * own words, `12:00 AM`, on the 12-hour clock (dates.ts), and words that are no time give no time,
 * not a failure. The field writes the time on the page's clock. Its label, helper, size and states
 * from their controls, a cleared label or helper left out; mandatory while `required` holds any
 * text. Its list's opening and closing are logged.
 */

import { TimePicker, type TimePickerProps } from '../../src/TimePicker.js';
import { hhmm } from './dates.js';
import type { PlaygroundBuilder } from './types.js';

export default {
  render: (p) => {
    const label = p.words('label');
    return (
      <TimePicker
        size={p.choice<NonNullable<TimePickerProps['size']>>('size')}
        disabled={p.flag('disabled')}
        error={p.flag('error')}
        label={label}
        mandatory={p.words('required') !== undefined}
        helper={p.words('helper')}
        value={hhmm(p.text('value'))}
        onChange={(time) => {
          p.set('value', time ?? '');
          p.log('onChange', time);
        }}
        onOpen={() => p.log('onOpen')}
        onClose={() => p.log('onClose')}
        inputProps={label ? undefined : { 'aria-label': 'Label' }}
      />
    );
  },
} satisfies PlaygroundBuilder;
