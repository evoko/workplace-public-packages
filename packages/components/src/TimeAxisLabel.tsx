/**
 * SOLAR Time Axis Label.
 *
 * Written by hand, and never regenerated; its layer tree and slot names are the IR's,
 * `solarTimeAxisLabelTree` and `solarTimeAxisLabelSlots` beside the recipe. What it looks like is
 * not here. That is the recipe, `solarTimeAxisLabelStyle` and `solarTimeAxisLabelCompose` in
 * `@bwp-web/styles/mui`: the rail's cell, its hour's text style and colour, by density.
 *
 * An hour marker on the left rail of a week or day grid, as the description says, drawn from
 * Figma's layer tree (`internal/layers.tsx`): its hour (`children`, "9 AM"), at the top of its
 * row, the current hour's tinted and bolder (`emphasis` now); as tall as its hour's row, by
 * `density`. A styled part: which hour it marks is the caller's. The app must load
 * `@bwp-web/styles/tokens.css`.
 */

import { useSolarProps } from './internal/theme.js';
import Box, { type BoxProps } from '@mui/material/Box';
import { forwardRef, type ReactNode } from 'react';
import {
  solarTimeAxisLabelCompose,
  solarTimeAxisLabelStyle,
  type SolarTimeAxisLabelProps,
  solarTimeAxisLabelSlots,
  solarTimeAxisLabelTree,
} from '@bwp-web/styles/mui';
import { drawChildren } from './internal/layers.js';

export interface TimeAxisLabelProps
  extends
    SolarTimeAxisLabelProps,
    // MUI types BoxProps' ref for any element; the component's own comes from forwardRef.
    Omit<BoxProps, keyof SolarTimeAxisLabelProps | 'children' | 'ref'> {
  /** The hour, in the caller's words ("9 AM"). */
  children: ReactNode;
}

export const TimeAxisLabel = forwardRef<HTMLDivElement, TimeAxisLabelProps>(
  function TimeAxisLabel(inProps, ref) {
    // As the app's MUI theme sets them (components.SolarTimeAxisLabel), under the caller's own.
    const { emphasis, density, children, sx, ...rest } = useSolarProps(
      inProps,
      'SolarTimeAxisLabel',
    );
    const look = { emphasis, density };
    return (
      <Box
        ref={ref}
        role="rowheader"
        aria-current={emphasis === 'now' ? 'time' : undefined}
        {...rest}
        sx={[solarTimeAxisLabelStyle(look), ...(Array.isArray(sx) ? sx : [sx])]}
      >
        {drawChildren('root', {
          prefix: 'SolarTimeAxisLabel',
          tree: solarTimeAxisLabelTree,
          slots: solarTimeAxisLabelSlots,
          parts: solarTimeAxisLabelCompose(look),
          text: { label: children },
        })}
      </Box>
    );
  },
);
