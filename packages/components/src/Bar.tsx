/**
 * SOLAR Bar.
 *
 * Written by hand, and never regenerated; its layer tree and slot names are the IR's,
 * `solarBarTree` and `solarBarSlots` beside the recipe. What it looks like is not here. That is
 * the recipe, `solarBarStyle` in `@bwp-web/styles/mui`: its fill, by colour.
 *
 * One bar of a chart, as the description says: a rectangle in one of SOLAR's data colours
 * (`color`: the category, scale, delta and feedback palettes). It fills the box it is given, its
 * length and thickness the data's. Decorative: the chart says what it shows. The app must load
 * `@bwp-web/styles/tokens.css`.
 */

import { useSolarProps } from './internal/theme.js';
import Box, { type BoxProps } from '@mui/material/Box';
import { forwardRef } from 'react';
import {
  solarBarCompose,
  solarBarStyle,
  type SolarBarProps,
  solarBarSlots,
  solarBarTree,
} from '@bwp-web/styles/mui';
import { drawChildren } from './internal/layers.js';

export interface BarProps
  extends
    SolarBarProps,
    // MUI types BoxProps' ref for any element; the component's own comes from forwardRef.
    Omit<BoxProps, keyof SolarBarProps | 'children' | 'ref'> {}

export const Bar = forwardRef<HTMLDivElement, BarProps>(
  function Bar(inProps, ref) {
    // As the app's MUI theme sets them (components.SolarBar), under the caller's own.
    const { color, sx, ...rest } = useSolarProps(inProps, 'SolarBar');
    const look = { color };
    return (
      <Box
        ref={ref}
        aria-hidden
        {...rest}
        sx={[solarBarStyle(look), ...(Array.isArray(sx) ? sx : [sx])]}
      >
        {drawChildren('root', {
          prefix: 'SolarBar',
          tree: solarBarTree,
          slots: solarBarSlots,
          parts: solarBarCompose(look),
        })}
      </Box>
    );
  },
);
