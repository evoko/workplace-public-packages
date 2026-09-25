import oracle from '../../../../../spec/verify/calendar-day-cell.json';
import {
  CalendarDayCell,
  type CalendarDayCellProps,
} from '../../../src/CalendarDayCell.js';
import { EventChip } from '../../../src/EventChip.js';
import type { VisualCase } from './types.js';

type Look = Pick<
  CalendarDayCellProps,
  'today' | 'selected' | 'todayColumn' | 'otherMonth'
>;

// Each state with Figma's date and its three sample chips (blue, green and yellow), in Figma's
// 160 (it fills its column).
export default {
  oracle,
  render: (v) => (
    <div style={{ width: 160 }}>
      <CalendarDayCell {...(v.props as Look)} data-case-root="" day="15">
        <EventChip category="blue" title="Event title" />
        <EventChip category="green" title="Event title" />
        <EventChip category="yellow" title="Event title" />
      </CalendarDayCell>
    </div>
  ),
} satisfies VisualCase;
