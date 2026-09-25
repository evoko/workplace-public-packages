/**
 * SOLAR Time Slot.
 *
 * Written by hand, and never regenerated; its layer tree and slot names are the IR's,
 * `solarTimeSlotTree` and `solarTimeSlotSlots` beside the recipe. What it looks like is not here.
 * That is the recipe, `solarTimeSlotStyle` and `solarTimeSlotCompose` in `@bwp-web/styles/mui`: the
 * cell, its edges and its dashed half-hour rule, by state and density.
 *
 * An empty cell of a week or day grid, as the description says, drawn from Figma's layer tree
 * (`internal/layers.tsx`): edged on its top and left so the cells compose into a grid, its
 * half-hour rule across its middle, as tall as an hour's row by `density`. It is a grid cell,
 * hovered under a pointer, and `selected` (the cell a click creates an event in) with a
 * focus-bound edge; `onClick` is the caller's. It fills its day's column. `label` names its hour for
 * a screen reader. The app must load `@bwp-web/styles/tokens.css`.
 */

import { useSolarProps } from './internal/theme.js';
import Box, { type BoxProps } from '@mui/material/Box';
import { forwardRef } from 'react';
import {
  solarTimeSlotCompose,
  solarTimeSlotStyle,
  type SolarTimeSlotProps,
  solarTimeSlotSlots,
  solarTimeSlotTree,
} from '@bwp-web/styles/mui';
import { drawChildren } from './internal/layers.js';

export interface TimeSlotProps
  extends
    SolarTimeSlotProps,
    // MUI types BoxProps' ref for any element; the component's own comes from forwardRef.
    Omit<BoxProps, keyof SolarTimeSlotProps | 'children' | 'ref'> {
  /** Its hour and day, for a screen reader ("Monday 9 AM"). */
  label?: string;
}

const P = 'SolarTimeSlot';

export const TimeSlot = forwardRef<HTMLDivElement, TimeSlotProps>(
  function TimeSlot(inProps, ref) {
    // As the app's MUI theme sets them (components.SolarTimeSlot), under the caller's own.
    const { selected, density, label, className, sx, ...rest } = useSolarProps(
      inProps,
      'SolarTimeSlot',
    );
    const look = { selected, density };
    return (
      <Box
        ref={ref}
        role="gridcell"
        aria-selected={selected ?? false}
        aria-label={label}
        {...rest}
        className={
          [selected ? `${P}-selected` : null, className]
            .filter(Boolean)
            .join(' ') || undefined
        }
        sx={[solarTimeSlotStyle(look), ...(Array.isArray(sx) ? sx : [sx])]}
      >
        {drawChildren('root', {
          prefix: P,
          tree: solarTimeSlotTree,
          slots: solarTimeSlotSlots,
          parts: solarTimeSlotCompose(look),
        })}
      </Box>
    );
  },
);
