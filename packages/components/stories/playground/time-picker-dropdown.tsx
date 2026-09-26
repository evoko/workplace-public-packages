/**
 * TimePicker Dropdown's Playground: the list of times, every 30 minutes, in place; its size from
 * its control. The time chosen is the `value` extra, `HH:MM` on the 24-hour clock, which choosing a
 * row sets; words that are no time choose none (dates.ts). The `content` toggle shows the times:
 * off, the list offers none (a range that holds no time), as an app's with nothing left to offer.
 */

import {
  TimePickerDropdown,
  type TimePickerDropdownProps,
} from '../../src/TimePickerDropdown.js';
import { hhmm } from './dates.js';
import type { PlaygroundBuilder } from './types.js';

export default {
  render: (p) => {
    const content = p.flag('content');
    return (
      <TimePickerDropdown
        size={p.choice<NonNullable<TimePickerDropdownProps['size']>>('size')}
        value={hhmm(p.text('value'))}
        // A range that ends before it starts, where the content is hidden: no time.
        min={content ? undefined : '23:59'}
        max={content ? undefined : '00:00'}
        onChange={(time) => {
          p.set('value', time);
          p.log('onChange', time);
        }}
      />
    );
  },
} satisfies PlaygroundBuilder;
