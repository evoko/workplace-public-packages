/**
 * SOLAR Trend Badge.
 *
 * Written by hand, and never regenerated; its layer tree and slot names are the IR's,
 * `solarTrendBadgeTree` and `solarTrendBadgeSlots` beside the recipe. What it looks like is not
 * here. That is the recipe, `solarTrendBadgeStyle` and `solarTrendBadgeCompose` in
 * `@bwp-web/styles/mui`: each type’s disc and its arrow or dash, their colours, by size.
 *
 * Bespoke: a drawn mark, an arrow on a disc, drawn from Figma’s layer tree (`internal/layers.tsx`).
 * Decorative unless given a `label`, which it then announces as an image: say the change in words
 * beside it, or name it (`label="Up 12%"`). The app must load `@bwp-web/styles/tokens.css`.
 */

import { useSolarProps } from './internal/theme.js';
import Box, { type BoxProps } from '@mui/material/Box';
import { forwardRef } from 'react';
import {
  solarTrendBadgeCompose,
  solarTrendBadgeStyle,
  type SolarTrendBadgeProps,
  solarTrendBadgeSlots,
  solarTrendBadgeTree,
} from '@bwp-web/styles/mui';
import { drawChildren } from './internal/layers.js';

export interface TrendBadgeProps
  extends
    SolarTrendBadgeProps,
    // MUI types BoxProps' ref for any element; the component's own comes from forwardRef.
    Omit<BoxProps, keyof SolarTrendBadgeProps | 'children' | 'ref'> {
  /**
   * What the trend means, for a screen reader. Without it the badge is decorative and hidden from
   * assistive technology, so say the change in words beside it.
   */
  label?: string;
}

export const TrendBadge = forwardRef<HTMLSpanElement, TrendBadgeProps>(
  function TrendBadge(inProps, ref) {
    // As the app's MUI theme sets them (components.SolarTrendBadge), under the caller's own.
    const { type, size, label, sx, ...rest } = useSolarProps(
      inProps,
      'SolarTrendBadge',
    );
    const parts = solarTrendBadgeCompose({ type, size });
    return (
      <Box
        component="span"
        ref={ref}
        role={label ? 'img' : undefined}
        aria-label={label}
        aria-hidden={label ? undefined : true}
        {...rest}
        sx={[
          solarTrendBadgeStyle({ type, size }),
          ...(Array.isArray(sx) ? sx : [sx]),
        ]}
      >
        {drawChildren('root', {
          prefix: 'SolarTrendBadge',
          tree: solarTrendBadgeTree,
          slots: solarTrendBadgeSlots,
          parts,
        })}
      </Box>
    );
  },
);
