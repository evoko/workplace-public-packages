/**
 * SOLAR Date Picker Day Cell.
 *
 * Written by hand, and never regenerated; its layer tree and slot names are the IR's,
 * `solarDatePickerDayCellTree` and `solarDatePickerDayCellSlots` beside the recipe. What it looks
 * like is not here. That is the recipe, `solarDatePickerDayCellStyle` and
 * `solarDatePickerDayCellCompose` in `@bwp-web/styles/mui`: the day’s fill, edge and ink by state
 * and range role.
 *
 * Bespoke: one day of a DatePickerOpen's grid, drawn from Figma's layer tree
 * (`internal/layers.tsx`) as a grid cell, which the grid gives the focus to with the arrow keys (a
 * roving `tabIndex`), announced selected, as today's date, or disabled. Its words are the day of
 * the month; name it with the whole date (`aria-label`). `rangeRole` draws its part of a range as
 * Figma draws one, though the pickers choose one date for now. The app must load
 * `@bwp-web/styles/tokens.css`.
 */

import { useSolarProps } from './internal/theme.js';
import Box, { type BoxProps } from '@mui/material/Box';
import { forwardRef, type ReactNode } from 'react';
import {
  solarDatePickerDayCellCompose,
  solarDatePickerDayCellStyle,
  type SolarDatePickerDayCellProps,
  solarDatePickerDayCellSlots,
  solarDatePickerDayCellTree,
} from '@bwp-web/styles/mui';
import { drawChildren } from './internal/layers.js';

export interface DatePickerDayCellProps
  extends
    SolarDatePickerDayCellProps,
    // MUI types BoxProps' ref for any element; the component's own comes from forwardRef.
    Omit<BoxProps, keyof SolarDatePickerDayCellProps | 'children' | 'ref'> {
  /** The day of the month. */
  children: ReactNode;
}

export const DatePickerDayCell = forwardRef<
  HTMLDivElement,
  DatePickerDayCellProps
>(function DatePickerDayCell(inProps, ref) {
  // As the app's MUI theme sets them (components.SolarDatePickerDayCell), under the caller's own.
  const {
    selected,
    today,
    disabled,
    filled,
    error,
    rangeRole,
    children,
    className,
    onClick,
    sx,
    ...rest
  } = useSolarProps(inProps, 'SolarDatePickerDayCell');
  const parts = solarDatePickerDayCellCompose({
    selected,
    today,
    disabled,
    filled,
    error,
    rangeRole,
  });
  return (
    <Box
      component="div"
      ref={ref}
      role="gridcell"
      aria-selected={selected ?? false}
      aria-current={today ? 'date' : undefined}
      aria-disabled={disabled || undefined}
      onClick={disabled ? undefined : onClick}
      className={
        [
          today ? 'SolarDatePickerDayCell-today' : null,
          selected ? 'SolarDatePickerDayCell-selected' : null,
          filled ? 'SolarDatePickerDayCell-filled' : null,
          error ? 'SolarDatePickerDayCell-error' : null,
          disabled ? 'SolarDatePickerDayCell-disabled' : null,
          className,
        ]
          .filter(Boolean)
          .join(' ') || undefined
      }
      {...rest}
      sx={[
        solarDatePickerDayCellStyle({
          selected,
          today,
          disabled,
          filled,
          error,
          rangeRole,
        }),
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      {drawChildren('root', {
        prefix: 'SolarDatePickerDayCell',
        tree: solarDatePickerDayCellTree,
        slots: solarDatePickerDayCellSlots,
        parts,
        text: { day: children },
      })}
    </Box>
  );
});
