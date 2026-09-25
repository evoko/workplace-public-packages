/**
 * SOLAR StatusIndicator.
 *
 * Written by hand, and never regenerated; its layer tree and slot names are the IR's,
 * `solarStatusIndicatorTree` and `solarStatusIndicatorSlots` beside the recipe. What it looks like
 * is not here. That is the recipe, `solarStatusIndicatorStyle` and `solarStatusIndicatorCompose` in
 * `@bwp-web/styles/mui`: each type’s disc or triangle, its mark, their colours and where they sit.
 *
 * Bespoke: a drawn mark. Each type is its own drawing, so this draws Figma’s layer tree
 * (`internal/layers.tsx`): a layer as a glyph (an SVG of Figma’s outline) where the recipe has one
 * and as a box where it does not. Decorative unless given a `label`, which it then announces as an
 * image. The app must load `@bwp-web/styles/tokens.css`.
 */

import { useSolarProps } from './internal/theme.js';
import Box, { type BoxProps } from '@mui/material/Box';
import { forwardRef } from 'react';
import {
  solarStatusIndicatorCompose,
  solarStatusIndicatorStyle,
  type SolarStatusIndicatorProps,
  solarStatusIndicatorSlots,
  solarStatusIndicatorTree,
} from '@bwp-web/styles/mui';
import { drawChildren } from './internal/layers.js';

export interface StatusIndicatorProps
  extends
    SolarStatusIndicatorProps,
    // MUI types BoxProps' ref for any element; the component's own comes from forwardRef.
    Omit<BoxProps, keyof SolarStatusIndicatorProps | 'children' | 'ref'> {
  /**
   * What the status means, for a screen reader. Without it the mark is decorative and hidden from
   * assistive technology, so say the status in words beside it.
   */
  label?: string;
}

export const StatusIndicator = forwardRef<
  HTMLSpanElement,
  StatusIndicatorProps
>(function StatusIndicator(inProps, ref) {
  // As the app's MUI theme sets them (components.SolarStatusIndicator), under the caller's own.
  const { type, size, label, sx, ...rest } = useSolarProps(
    inProps,
    'SolarStatusIndicator',
  );
  const parts = solarStatusIndicatorCompose({ type, size });
  return (
    <Box
      component="span"
      ref={ref}
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      {...rest}
      sx={[
        solarStatusIndicatorStyle({ type, size }),
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      {drawChildren('root', {
        prefix: 'SolarStatusIndicator',
        tree: solarStatusIndicatorTree,
        slots: solarStatusIndicatorSlots,
        parts,
      })}
    </Box>
  );
});
