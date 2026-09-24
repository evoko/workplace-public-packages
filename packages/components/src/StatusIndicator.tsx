/**
 * SOLAR StatusIndicator.
 *
 * Scaffolded once by `npm run solar:scaffold StatusIndicator` from
 * spec/components/statusindicator.json, and owned by developers from then on: change it freely.
 * What it looks like is not here. That is the recipe, `solarStatusIndicatorStyle` and
 * `solarStatusIndicatorCompose` in `@bwp-web/styles/mui`: each type’s disc or triangle, its mark,
 * their colours and where they sit.
 *
 * Bespoke: a drawn mark. Each type is its own drawing, so this draws Figma’s layer tree
 * (`internal/layers.tsx`): a layer as a glyph (an SVG of Figma’s outline) where the recipe has one
 * and as a box where it does not. Decorative unless given a `label`, which it then announces as an
 * image. The app must load `@bwp-web/styles/tokens.css`.
 */

import Box, { type BoxProps } from '@mui/material/Box';
import { forwardRef } from 'react';
import {
  solarStatusIndicatorCompose,
  solarStatusIndicatorStyle,
  type SolarStatusIndicatorProps,
} from '@bwp-web/styles/mui';
import { drawChildren } from './internal/layers.js';

/** Each layer's children, as Figma nests them. */
const TREE: Record<string, string[]> = {
  root: ['innerPath', 'union', 'container', 'frame3'],
  frame3: ['frame3InnerPath'],
  container: ['containerInnerPath', 'icon', 'containerUnion'],
};

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
>(function StatusIndicator({ type, size, label, sx, ...rest }, ref) {
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
        tree: TREE,
        parts,
      })}
    </Box>
  );
});
