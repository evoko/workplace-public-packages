/**
 * SOLAR Tree Indent.
 *
 * Written by hand, and never regenerated; its layer tree and slot names are the IR's,
 * `solarTreeIndentTree` and `solarTreeIndentSlots` beside the recipe. What it looks like is not
 * here. That is the recipe, `solarTreeIndentStyle` and `solarTreeIndentCompose` in
 * `@bwp-web/styles/mui`: each depth’s row of units and their size.
 *
 * Bespoke: a spacer, a row of `depth` units of indent, drawn from Figma’s layer tree
 * (`internal/layers.tsx`). Tree Item composes it. Decorative: the tree’s own semantics
 * (`aria-level`) say how deep a row is. The app must load `@bwp-web/styles/tokens.css`.
 */

import { useSolarProps } from './internal/theme.js';
import Box, { type BoxProps } from '@mui/material/Box';
import { forwardRef } from 'react';
import {
  solarTreeIndentCompose,
  solarTreeIndentStyle,
  type SolarTreeIndentProps,
  solarTreeIndentSlots,
  solarTreeIndentTree,
} from '@bwp-web/styles/mui';
import { drawChildren } from './internal/layers.js';

export interface TreeIndentProps
  extends
    SolarTreeIndentProps,
    // MUI types BoxProps' ref for any element; the component's own comes from forwardRef.
    Omit<BoxProps, keyof SolarTreeIndentProps | 'children' | 'ref'> {}

export const TreeIndent = forwardRef<HTMLSpanElement, TreeIndentProps>(
  function TreeIndent(inProps, ref) {
    // As the app's MUI theme sets them (components.SolarTreeIndent), under the caller's own.
    const { depth, sx, ...rest } = useSolarProps(inProps, 'SolarTreeIndent');
    const parts = solarTreeIndentCompose({ depth });
    return (
      <Box
        component="span"
        ref={ref}
        aria-hidden
        {...rest}
        sx={[
          solarTreeIndentStyle({ depth }),
          ...(Array.isArray(sx) ? sx : [sx]),
        ]}
      >
        {drawChildren('root', {
          prefix: 'SolarTreeIndent',
          tree: solarTreeIndentTree,
          slots: solarTreeIndentSlots,
          parts,
        })}
      </Box>
    );
  },
);
