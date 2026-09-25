/**
 * SOLAR Calendar Day Cell.
 *
 * Written by hand, and never regenerated; its layer tree and slot names are the IR's,
 * `solarCalendarDayCellTree` and `solarCalendarDayCellSlots` beside the recipe. What it looks like
 * is not here. That is the recipe, `solarCalendarDayCellStyle` and `solarCalendarDayCellCompose`
 * in `@bwp-web/styles/mui`: the cell, its date's pill and text style, and its looks by state.
 *
 * One day of a calendar's month grid, as the description says, drawn from Figma's layer tree
 * (`internal/layers.tsx`): its `day` (the day of the month) and the caller's Event Chips
 * (`children`) stacked under it. It is a grid cell: `today` puts its date in a pill and marks it
 * the current date, `selected` fills it and says so, `todayColumn` tints a day in today's column
 * of a week, and `otherMonth` fades a day of the month before or after. `label` names the whole
 * date for a screen reader ("Monday 15 September"). It fills its column; its height is Figma's.
 * A styled part: which day it is, its events, and what a click on it does, are the caller's. The
 * app must load `@bwp-web/styles/tokens.css`.
 */

import { useSolarProps } from './internal/theme.js';
import Box, { type BoxProps } from '@mui/material/Box';
import { forwardRef, type ReactNode } from 'react';
import {
  solarCalendarDayCellCompose,
  solarCalendarDayCellStyle,
  type SolarCalendarDayCellProps,
  solarCalendarDayCellSlots,
  solarCalendarDayCellTree,
} from '@bwp-web/styles/mui';
import { drawChildren } from './internal/layers.js';

export interface CalendarDayCellProps
  extends
    SolarCalendarDayCellProps,
    // MUI types BoxProps' ref for any element; the component's own comes from forwardRef.
    Omit<BoxProps, keyof SolarCalendarDayCellProps | 'children' | 'ref'> {
  /** The day of the month. */
  day: ReactNode;
  /** The whole date, for a screen reader. */
  label?: string;
  /** Its events: SOLAR Event Chips. */
  children?: ReactNode;
}

const P = 'SolarCalendarDayCell';

export const CalendarDayCell = forwardRef<HTMLDivElement, CalendarDayCellProps>(
  function CalendarDayCell(inProps, ref) {
    // As the app's MUI theme sets them (components.SolarCalendarDayCell), under the caller's own.
    const {
      today,
      selected,
      todayColumn,
      otherMonth,
      day,
      label,
      children,
      className,
      sx,
      ...rest
    } = useSolarProps(inProps, 'SolarCalendarDayCell');
    const look = { today, selected, todayColumn, otherMonth };
    const parts = solarCalendarDayCellCompose(look);
    return (
      <Box
        ref={ref}
        role="gridcell"
        aria-selected={selected ?? false}
        aria-current={today ? 'date' : undefined}
        aria-label={label}
        {...rest}
        className={
          [
            today ? `${P}-today` : null,
            selected ? `${P}-selected` : null,
            todayColumn ? `${P}-todayColumn` : null,
            otherMonth ? `${P}-otherMonth` : null,
            className,
          ]
            .filter(Boolean)
            .join(' ') || undefined
        }
        sx={[
          solarCalendarDayCellStyle(look),
          ...(Array.isArray(sx) ? sx : [sx]),
        ]}
      >
        {drawChildren('root', {
          prefix: P,
          tree: solarCalendarDayCellTree,
          slots: solarCalendarDayCellSlots,
          parts,
          // The whole date names the cell where it is given; its figure is then not read twice.
          text: { day: label ? <span aria-hidden>{day}</span> : day },
          content: { events: children },
        })}
      </Box>
    );
  },
);
