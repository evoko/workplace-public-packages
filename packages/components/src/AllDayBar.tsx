/**
 * SOLAR All-Day Bar.
 *
 * Written by hand, and never regenerated; its layer tree and slot names are the IR's,
 * `solarAllDayBarTree` and `solarAllDayBarSlots` beside the recipe. What it looks like is not here.
 * That is the recipe, `solarAllDayBarStyle` and `solarAllDayBarCompose` in `@bwp-web/styles/mui`:
 * its stripe or fill, and its words' text styles and colours.
 *
 * An event that spans a day or more, as the description says, drawn from Figma's layer tree
 * (`internal/layers.tsx`): a bar in a week or day grid's all-day row, or across a month grid's
 * columns, as a stripe beside neutral words (`variant` subtle) or a full fill with inverse words
 * (solid); its `time` where given ("All day") and its `title`, on one line, cut short at the bar's
 * end. `span` says which segment of a bar across columns it is. It fills the columns it spans. A
 * styled part: what the event is, and what a click on it does, are the caller's. The app must load
 * `@bwp-web/styles/tokens.css`.
 */

import { useSolarProps } from './internal/theme.js';
import Box, { type BoxProps } from '@mui/material/Box';
import { forwardRef, type ReactNode } from 'react';
import {
  solarAllDayBarCompose,
  solarAllDayBarStyle,
  type SolarAllDayBarProps,
  solarAllDayBarSlots,
  solarAllDayBarTree,
} from '@bwp-web/styles/mui';
import { drawChildren } from './internal/layers.js';

export interface AllDayBarProps
  extends
    SolarAllDayBarProps,
    // MUI types BoxProps' ref for any element; the component's own comes from forwardRef.
    Omit<BoxProps, keyof SolarAllDayBarProps | 'children' | 'title' | 'ref'> {
  /** The event's title. */
  title: ReactNode;
  /** When it is, in the caller's words ("All day"); given, it is drawn before the title. */
  time?: ReactNode;
}

export const AllDayBar = forwardRef<HTMLDivElement, AllDayBarProps>(
  function AllDayBar(inProps, ref) {
    // As the app's MUI theme sets them (components.SolarAllDayBar), under the caller's own.
    const { variant, span, title, time, sx, ...rest } = useSolarProps(
      inProps,
      'SolarAllDayBar',
    );
    const look = { variant, span };
    const composed = solarAllDayBarCompose(look);
    // A part left out is not drawn.
    const parts = {
      ...composed,
      time: { ...composed.time, present: time != null },
    };
    return (
      <Box
        ref={ref}
        {...rest}
        sx={[solarAllDayBarStyle(look), ...(Array.isArray(sx) ? sx : [sx])]}
      >
        {drawChildren('root', {
          prefix: 'SolarAllDayBar',
          tree: solarAllDayBarTree,
          slots: solarAllDayBarSlots,
          parts,
          text: { title, time },
        })}
      </Box>
    );
  },
);
