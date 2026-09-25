/**
 * SOLAR Weekday Header.
 *
 * Written by hand, and never regenerated; its layer tree and slot names are the IR's,
 * `solarWeekdayHeaderTree` and `solarWeekdayHeaderSlots` beside the recipe. What it looks like is
 * not here. That is the recipe, `solarWeekdayHeaderStyle` and `solarWeekdayHeaderCompose` in
 * `@bwp-web/styles/mui`: the header, its edge and its weekday's text style and colour.
 *
 * A calendar grid's column header, as the description says, drawn from Figma's layer tree
 * (`internal/layers.tsx`): its weekday (`children`, "Mon"), today's tinted (`emphasis` today). It
 * is a column header, and fills its column. A styled part: which day it heads is the caller's. The
 * app must load `@bwp-web/styles/tokens.css`.
 */

import { useSolarProps } from './internal/theme.js';
import Box, { type BoxProps } from '@mui/material/Box';
import { forwardRef, type ReactNode } from 'react';
import {
  solarWeekdayHeaderCompose,
  solarWeekdayHeaderStyle,
  type SolarWeekdayHeaderProps,
  solarWeekdayHeaderSlots,
  solarWeekdayHeaderTree,
} from '@bwp-web/styles/mui';
import { drawChildren } from './internal/layers.js';

export interface WeekdayHeaderProps
  extends
    SolarWeekdayHeaderProps,
    // MUI types BoxProps' ref for any element; the component's own comes from forwardRef.
    Omit<BoxProps, keyof SolarWeekdayHeaderProps | 'children' | 'ref'> {
  /** The weekday, in the caller's words ("Mon"). */
  children: ReactNode;
}

export const WeekdayHeader = forwardRef<HTMLDivElement, WeekdayHeaderProps>(
  function WeekdayHeader(inProps, ref) {
    // As the app's MUI theme sets them (components.SolarWeekdayHeader), under the caller's own.
    const { emphasis, children, sx, ...rest } = useSolarProps(
      inProps,
      'SolarWeekdayHeader',
    );
    const look = { emphasis };
    return (
      <Box
        ref={ref}
        role="columnheader"
        aria-current={emphasis === 'today' ? 'date' : undefined}
        {...rest}
        sx={[solarWeekdayHeaderStyle(look), ...(Array.isArray(sx) ? sx : [sx])]}
      >
        {drawChildren('root', {
          prefix: 'SolarWeekdayHeader',
          tree: solarWeekdayHeaderTree,
          slots: solarWeekdayHeaderSlots,
          parts: solarWeekdayHeaderCompose(look),
          text: { label: children },
        })}
      </Box>
    );
  },
);
