/**
 * SOLAR Cursor.
 *
 * Scaffolded once by `npm run solar:scaffold Cursor` from spec/components/cursor.json, and owned by
 * developers from then on: change it freely. What it looks like is not here. That is the recipe,
 * `solarCursorStyle` and `solarCursorCompose` in `@bwp-web/styles/mui`: each type’s glyph, its
 * colours and outline.
 *
 * Bespoke: a pointer glyph for the canvas and authoring surfaces (the Spatial and Flow editors),
 * where the native cursor cannot say which tool is active, drawn from Figma’s layer tree
 * (`internal/layers.tsx`). Decorative: the tool it shows is said elsewhere, and standard UI keeps
 * the native cursor. The app must load `@bwp-web/styles/tokens.css`.
 */

import Box, { type BoxProps } from '@mui/material/Box';
import { forwardRef } from 'react';
import {
  solarCursorCompose,
  solarCursorStyle,
  type SolarCursorProps,
} from '@bwp-web/styles/mui';
import { drawChildren } from './internal/layers.js';

/** Each layer's children, as Figma nests them. */
const TREE: Record<string, string[]> = {
  root: [
    'rectangle237',
    'importedLayersCopy4',
    'oval3',
    'rectangle8',
    'rectangle254',
    'path',
    'oval38',
    'oval',
    'rectangle6',
    'rectangle272',
  ],
};

export interface CursorProps
  extends
    SolarCursorProps,
    // MUI types BoxProps' ref for any element; the component's own comes from forwardRef.
    Omit<BoxProps, keyof SolarCursorProps | 'children' | 'ref'> {}

export const Cursor = forwardRef<HTMLSpanElement, CursorProps>(function Cursor(
  { type, sx, ...rest },
  ref,
) {
  const parts = solarCursorCompose({ type });
  return (
    <Box
      component="span"
      ref={ref}
      aria-hidden
      {...rest}
      sx={[solarCursorStyle({ type }), ...(Array.isArray(sx) ? sx : [sx])]}
    >
      {drawChildren('root', {
        prefix: 'SolarCursor',
        tree: TREE,
        parts,
      })}
    </Box>
  );
});
