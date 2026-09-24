import oracle from '../../../../../spec/verify/date-picker-day-cell.json';
import {
  DatePickerDayCell,
  type DatePickerDayCellProps,
} from '../../../src/DatePickerDayCell.js';
import type { VisualCase } from './types.js';

// A day in the variant's state and range role, focusable as the grid makes one, named by its date.
export default {
  oracle,
  render: (v) => (
    <DatePickerDayCell
      {...(v.props as Omit<DatePickerDayCellProps, 'children'>)}
      tabIndex={0}
      aria-label="24 April 2026"
    >
      24
    </DatePickerDayCell>
  ),
} satisfies VisualCase;
