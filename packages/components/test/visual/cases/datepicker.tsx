import oracle from '../../../../../spec/verify/datepicker.json';
import { DatePicker, type DatePickerProps } from '../../../src/DatePicker.js';
import type { VisualCase } from './types.js';

// Every part shown, with Figma's own date: holding it where it is filled (the oracle's content),
// and showing its words as the placeholder otherwise.
export default {
  oracle,
  render: (v) => (
    <DatePicker
      {...(v.props as Pick<DatePickerProps, 'size' | 'disabled' | 'error'>)}
      label="Select Date"
      mandatory
      helper="Helper text"
      locale="en-GB"
      value={v.content?.includes('value') ? '2026-05-11' : null}
      onChange={() => {}}
      placeholder="11/05/2026"
    />
  ),
} satisfies VisualCase;
