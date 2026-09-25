/**
 * SOLAR Bar Stack.
 *
 * Written by hand, and never regenerated; its layer tree and slot names are the IR's,
 * `solarBarStackTree` and `solarBarStackSlots` beside the recipe. What it looks like is not here.
 * That is the recipe, `solarBarStackStyle` in `@bwp-web/styles/mui`: the frame that clips the
 * segments to rounded ends, its direction and the gap between them.
 *
 * A single column or row split into its categories, as the description says: the caller's
 * `segments`, each a SOLAR Bar in its `color`, as long as its `value`'s share of the whole, down
 * (`orientation` vertical) or across. It fills the box it is given. Decorative: what it shows is
 * the caller's to say. The app must load `@bwp-web/styles/tokens.css`.
 */

import { useSolarProps } from './internal/theme.js';
import Box, { type BoxProps } from '@mui/material/Box';
import { forwardRef } from 'react';
import {
  solarBarStackCompose,
  solarBarStackStyle,
  type SolarBarStackProps,
  solarBarStackSlots,
  solarBarStackTree,
} from '@bwp-web/styles/mui';
import { Bar, type BarProps } from './Bar.js';
import { drawChildren } from './internal/layers.js';

/** One category: its share (any positive number, of the segments' sum) and its Bar colour. */
export interface BarStackSegment {
  value: number;
  color: NonNullable<BarProps['color']>;
}

export interface BarStackProps
  extends
    SolarBarStackProps,
    // MUI types BoxProps' ref for any element; the component's own comes from forwardRef.
    Omit<BoxProps, keyof SolarBarStackProps | 'children' | 'ref'> {
  /** The categories, first at the stack's start (its top, where vertical), as Figma draws them. */
  segments: readonly BarStackSegment[];
}

export const BarStack = forwardRef<HTMLDivElement, BarStackProps>(
  function BarStack(inProps, ref) {
    // As the app's MUI theme sets them (components.SolarBarStack), under the caller's own.
    const { orientation, segments, sx, ...rest } = useSolarProps(
      inProps,
      'SolarBarStack',
    );
    const look = { orientation };
    return (
      <Box
        ref={ref}
        aria-hidden
        {...rest}
        sx={[solarBarStackStyle(look), ...(Array.isArray(sx) ? sx : [sx])]}
      >
        {/* The frame's own layers (none but itself: Figma's segments are samples), then the
            caller's, each as long as its share. */}
        {drawChildren('root', {
          prefix: 'SolarBarStack',
          tree: solarBarStackTree,
          slots: solarBarStackSlots,
          parts: solarBarStackCompose(look),
        })}
        {segments.map((s, i) => (
          <Bar
            key={i}
            color={s.color}
            sx={{ flex: `${s.value} 1 0`, minWidth: 0, minHeight: 0 }}
          />
        ))}
      </Box>
    );
  },
);
