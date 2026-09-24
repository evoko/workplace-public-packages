import oracle from '../../../../../spec/verify/timepicker.json';
import { TimePicker, type TimePickerProps } from '../../../src/TimePicker.js';
import type { VisualCase } from './types.js';

// Every part shown, with Figma's own time: holding it where it is filled (the oracle's content),
// and showing its words as the placeholder otherwise.
export default {
  oracle,
  render: (v) => (
    <TimePicker
      {...(v.props as Pick<TimePickerProps, 'size' | 'disabled' | 'error'>)}
      label="Label"
      mandatory
      helper="Helper text"
      locale="en-US"
      value={v.content?.includes('value') ? '00:00' : null}
      onChange={() => {}}
      placeholder="12:00 AM"
    />
  ),
} satisfies VisualCase;
