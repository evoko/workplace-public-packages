import oracle from '../../../../../spec/verify/date-picker-open.json';
import type { DatePickerDayCellProps } from '../../../src/DatePickerDayCell.js';
import {
  DatePickerOpen,
  type DatePickerOpenProps,
} from '../../../src/DatePickerOpen.js';
import { isoOf, dateOf, weeksOf } from '../../../src/internal/calendar.js';
import type { OracleVariant, VisualCase } from './types.js';

type ChildLayer = {
  component?: string;
  variant?: Record<string, string | undefined>;
};

/** The days Figma draws in each grid (`dayGrid`, a double's two), in its order, with their state. */
const grids = (v: OracleVariant) => {
  const out: Record<string, [string, Record<string, string | undefined>][]> =
    {};
  for (const [name, l] of Object.entries(
    (v.layers ?? {}) as Record<string, ChildLayer>,
  ))
    if (l.component === 'Date Picker Day Cell')
      (out[name.replace(/DayCell\d*$/, '')] ??= []).push([
        name,
        l.variant ?? {},
      ]);
  return out;
};

// Figma's month, April 2026, its weeks from Monday as Figma's start, and May beside it in a double.
// Each day is keyed by its layer and drawn in the state and range role Figma draws that layer in: a
// double's May is a copy of April's grid in Figma, not May's days, and its range is Figma's, drawn
// by the cells' own prop, as the calendar chooses one date.
export default {
  oracle,
  render: (v) => {
    const days = grids(v);
    const double = v.props?.type === 'double';
    return (
      <DatePickerOpen
        {...(v.props as Pick<DatePickerOpenProps, 'inline' | 'type'>)}
        defaultMonth="2026-04-01"
        weekStartsOn={1}
        locale="en-GB"
        dayProps={(date, month) => {
          const grid =
            month === '2026-05'
              ? 'container2DayGrid'
              : double
                ? 'containerDayGrid'
                : 'dayGrid';
          const [year, m] = month.split('-').map(Number);
          const at = weeksOf(year, m, 1)
            .flat()
            .findIndex((d) => isoOf(dateOf(d)) === date);
          const [layer, { state, 'range-role': rangeRole } = {}] =
            days[grid]?.[at] ?? [];
          return {
            'data-layer': layer,
            selected: state === 'selected',
            today: state === 'today',
            disabled: state === 'disabled',
            rangeRole,
          } as Partial<DatePickerDayCellProps>;
        }}
      />
    );
  },
} satisfies VisualCase;
