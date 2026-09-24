/**
 * SOLAR DragHandle.
 *
 * Scaffolded once by `npm run solar:scaffold DragHandle` from spec/components/draghandle.json, and
 * owned by developers from then on: change it freely. What it looks like is not here. That is the
 * recipe, `solarDragHandleStyle` and `solarDragHandleCompose` in `@bwp-web/styles/mui`: the dots’
 * size and colour by state, and the grip’s padding and focus ring.
 *
 * Bespoke: a grip, drawn from Figma’s layer tree (`internal/layers.tsx`), that marks a row or card
 * as one to reorder. It is focusable and announced as a drag handle, "Reorder" unless named
 * otherwise; it is not a button, and does nothing itself. The drag is the caller's: spread its drag
 * and drop library's handle props over it (they may set `aria-pressed` while it is lifted, which
 * draws it pressed), and give the list the keyboard's Space to lift, arrows to move, Space to drop.
 * The app must load `@bwp-web/styles/tokens.css`.
 */

import Box, { type BoxProps } from '@mui/material/Box';
import { forwardRef } from 'react';
import {
  solarDragHandleCompose,
  solarDragHandleStyle,
  type SolarDragHandleProps,
} from '@bwp-web/styles/mui';
import { drawChildren } from './internal/layers.js';

/** Each layer's children, as Figma nests them. */
const TREE: Record<string, string[]> = {
  root: ['col1', 'col2'],
  col1: ['col1Dot', 'col1Dot2', 'col1Dot3'],
  col2: ['col2Dot', 'col2Dot2', 'col2Dot3'],
};

export interface DragHandleProps
  extends
    SolarDragHandleProps,
    // MUI types BoxProps' ref for any element; the component's own comes from forwardRef.
    Omit<BoxProps, keyof SolarDragHandleProps | 'children' | 'ref'> {}

export const DragHandle = forwardRef<HTMLSpanElement, DragHandleProps>(
  function DragHandle(
    { size, disabled, 'aria-label': label = 'Reorder', className, sx, ...rest },
    ref,
  ) {
    const parts = solarDragHandleCompose({ size, disabled });
    return (
      <Box
        component="span"
        ref={ref}
        role="button"
        aria-roledescription="drag handle"
        aria-label={label}
        aria-disabled={disabled || undefined}
        tabIndex={disabled ? -1 : 0}
        className={
          [disabled ? 'SolarDragHandle-disabled' : null, className]
            .filter(Boolean)
            .join(' ') || undefined
        }
        {...rest}
        sx={[
          solarDragHandleStyle({ size, disabled }),
          ...(Array.isArray(sx) ? sx : [sx]),
        ]}
      >
        {drawChildren('root', {
          prefix: 'SolarDragHandle',
          tree: TREE,
          parts,
        })}
      </Box>
    );
  },
);
