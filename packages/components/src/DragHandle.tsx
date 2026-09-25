/**
 * SOLAR DragHandle.
 *
 * Written by hand, and never regenerated; its layer tree and slot names are the IR's,
 * `solarDragHandleTree` and `solarDragHandleSlots` beside the recipe. What it looks like is not
 * here. That is the recipe, `solarDragHandleStyle` and `solarDragHandleCompose` in
 * `@bwp-web/styles/mui`: the dots’ size and colour by state, and the grip’s padding and focus ring.
 *
 * Bespoke: a grip, drawn from Figma’s layer tree (`internal/layers.tsx`), that marks a row or card
 * as one to reorder. It is focusable and announced as a drag handle, "Reorder" unless named
 * otherwise; it is not a button, and does nothing itself. The drag is the caller's: spread its drag
 * and drop library's handle props over it (they may set `aria-pressed` while it is lifted, which
 * draws it pressed), and give the list the keyboard's Space to lift, arrows to move, Space to drop.
 * The app must load `@bwp-web/styles/tokens.css`.
 */

import { useSolarProps } from './internal/theme.js';
import Box, { type BoxProps } from '@mui/material/Box';
import { forwardRef } from 'react';
import {
  solarDragHandleCompose,
  solarDragHandleStyle,
  type SolarDragHandleProps,
  solarDragHandleSlots,
  solarDragHandleTree,
} from '@bwp-web/styles/mui';
import { drawChildren } from './internal/layers.js';

export interface DragHandleProps
  extends
    SolarDragHandleProps,
    // MUI types BoxProps' ref for any element; the component's own comes from forwardRef.
    Omit<BoxProps, keyof SolarDragHandleProps | 'children' | 'ref'> {}

export const DragHandle = forwardRef<HTMLSpanElement, DragHandleProps>(
  function DragHandle(inProps, ref) {
    // As the app's MUI theme sets them (components.SolarDragHandle), under the caller's own.
    const {
      size,
      disabled,
      'aria-label': label = 'Reorder',
      className,
      sx,
      ...rest
    } = useSolarProps(inProps, 'SolarDragHandle');
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
          tree: solarDragHandleTree,
          slots: solarDragHandleSlots,
          parts,
        })}
      </Box>
    );
  },
);
