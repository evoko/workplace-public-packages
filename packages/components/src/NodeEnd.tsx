/**
 * SOLAR Node End.
 *
 * Written by hand, and never regenerated; its layer tree and slot names are the IR's,
 * `solarNodeEndTree` and `solarNodeEndSlots` beside the recipe. What it looks like is not here.
 * That is the recipe, `solarNodeEndStyle` and `solarNodeEndCompose` in `@bwp-web/styles/mui`: the
 * dot and its halo, their colour, size and place.
 *
 * Bespoke: a drawn marker, the end of a Coachmark’s connector, drawn from Figma’s layer tree
 * (`internal/layers.tsx`). Decorative always: the element a tour step is about carries its own
 * name, and the dot is never the only sign of what the step refers to. The app must load
 * `@bwp-web/styles/tokens.css`.
 */

import { useSolarProps } from './internal/theme.js';
import Box, { type BoxProps } from '@mui/material/Box';
import { forwardRef } from 'react';
import {
  solarNodeEndCompose,
  solarNodeEndStyle,
  type SolarNodeEndProps,
  solarNodeEndSlots,
  solarNodeEndTree,
} from '@bwp-web/styles/mui';
import { drawChildren } from './internal/layers.js';

export interface NodeEndProps
  extends
    SolarNodeEndProps,
    // MUI types BoxProps' ref for any element; the component's own comes from forwardRef.
    Omit<BoxProps, keyof SolarNodeEndProps | 'children' | 'ref'> {}

export const NodeEnd = forwardRef<HTMLSpanElement, NodeEndProps>(
  function NodeEnd(inProps, ref) {
    // As the app's MUI theme sets them (components.SolarNodeEnd), under the caller's own.
    const { halo, sx, ...rest } = useSolarProps(inProps, 'SolarNodeEnd');
    const parts = solarNodeEndCompose({ halo });
    return (
      <Box
        component="span"
        ref={ref}
        aria-hidden
        {...rest}
        sx={[solarNodeEndStyle({ halo }), ...(Array.isArray(sx) ? sx : [sx])]}
      >
        {drawChildren('root', {
          prefix: 'SolarNodeEnd',
          tree: solarNodeEndTree,
          slots: solarNodeEndSlots,
          parts,
        })}
      </Box>
    );
  },
);
