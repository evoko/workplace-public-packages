/**
 * SOLAR Stepper Indicator.
 *
 * Written by hand, and never regenerated; its layer tree and slot names are the IR's,
 * `solarStepperIndicatorTree` and `solarStepperIndicatorSlots` beside the recipe. What it looks
 * like is not here. That is the recipe, `solarStepperIndicatorStyle` and
 * `solarStepperIndicatorCompose` in `@bwp-web/styles/mui`: the circle’s fill and edge by status,
 * and its mark’s ink.
 *
 * Bespoke: the circle of one step's status, drawn from Figma's layer tree (`internal/layers.tsx`):
 * a tick when completed, the step's `number` when active or upcoming, a "!" in error. A part of a
 * Step, which names the step: hidden from a screen reader. The app must load
 * `@bwp-web/styles/tokens.css`.
 */

import { useSolarProps } from './internal/theme.js';
import Box, { type BoxProps } from '@mui/material/Box';
import { IconCheck } from '@bwp-web/assets';
import { forwardRef } from 'react';
import {
  solarStepperIndicatorCompose,
  solarStepperIndicatorStyle,
  type SolarStepperIndicatorProps,
  solarStepperIndicatorSlots,
  solarStepperIndicatorTree,
} from '@bwp-web/styles/mui';
import { drawChildren } from './internal/layers.js';

export interface StepperIndicatorProps
  extends
    SolarStepperIndicatorProps,
    // MUI types BoxProps' ref for any element; the component's own comes from forwardRef.
    Omit<BoxProps, keyof SolarStepperIndicatorProps | 'children' | 'ref'> {
  /** The step's number, from 1. */
  number: number;
}

export const StepperIndicator = forwardRef<
  HTMLSpanElement,
  StepperIndicatorProps
>(function StepperIndicator(inProps, ref) {
  // As the app's MUI theme sets them (components.SolarStepperIndicator), under the caller's own.
  const { status, number, sx, ...rest } = useSolarProps(
    inProps,
    'SolarStepperIndicator',
  );
  const parts = solarStepperIndicatorCompose({ status });
  return (
    <Box
      component="span"
      ref={ref}
      aria-hidden
      {...rest}
      sx={[
        solarStepperIndicatorStyle({ status }),
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      {drawChildren('root', {
        prefix: 'SolarStepperIndicator',
        tree: solarStepperIndicatorTree,
        slots: solarStepperIndicatorSlots,
        parts,
        text: { number, icon: '!' },
        icons: { iconCheck: <IconCheck /> },
      })}
    </Box>
  );
});
