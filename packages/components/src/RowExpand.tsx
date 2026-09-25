/**
 * SOLAR RowExpand.
 *
 * Written by hand, and never regenerated; its layer tree and slot names are the IR's,
 * `solarRowExpandTree` and `solarRowExpandSlots` beside the recipe. What it looks like is not here.
 * That is the recipe, `solarRowExpandStyle` and `solarRowExpandCompose` in `@bwp-web/styles/mui`:
 * each type’s chevron or connector, their colours and places.
 *
 * Bespoke: an expandable table row’s cell, drawn from Figma’s layer tree (`internal/layers.tsx`):
 * the chevron on the parent row, and the connector beside each child row. Decorative on its own:
 * a top Row draws it as its expand button (`component="button"`), which says whether the group is
 * shown (`aria-expanded`); a flat row's cell is drawn without its `chevron`. The app must load
 * `@bwp-web/styles/tokens.css`.
 */

import { useSolarProps } from './internal/theme.js';
import Box, { type BoxProps } from '@mui/material/Box';
import { IconChevronDown, IconChevronRight } from '@bwp-web/assets';
import { forwardRef } from 'react';
import {
  solarRowExpandCompose,
  solarRowExpandStyle,
  type SolarRowExpandProps,
  solarRowExpandSlots,
  solarRowExpandTree,
} from '@bwp-web/styles/mui';
import { drawChildren } from './internal/layers.js';

export interface RowExpandProps
  extends
    SolarRowExpandProps,
    // MUI types BoxProps' ref for any element; the component's own comes from forwardRef.
    Omit<BoxProps, keyof SolarRowExpandProps | 'children' | 'ref'> {
  /** Whether a collapsed or expanded cell draws its chevron; a flat row's cell is empty. */
  chevron?: boolean;
}

export const RowExpand = forwardRef<HTMLSpanElement, RowExpandProps>(
  function RowExpand(inProps, ref) {
    // As the app's MUI theme sets them (components.SolarRowExpand), under the caller's own.
    const {
      type,
      chevron = true,
      sx,
      ...rest
    } = useSolarProps(inProps, 'SolarRowExpand');
    const composed = solarRowExpandCompose({ type });
    // A flat row in a table that expands keeps the cell, empty (Row's non-expandable).
    const parts = chevron
      ? composed
      : {
          ...composed,
          iconChevronRight: { ...composed.iconChevronRight, present: false },
          iconChevronDown: { ...composed.iconChevronDown, present: false },
        };
    return (
      <Box
        component="span"
        ref={ref}
        aria-hidden
        {...rest}
        sx={[solarRowExpandStyle({ type }), ...(Array.isArray(sx) ? sx : [sx])]}
      >
        {drawChildren('root', {
          prefix: 'SolarRowExpand',
          tree: solarRowExpandTree,
          slots: solarRowExpandSlots,
          parts,
          icons: {
            iconChevronRight: <IconChevronRight />,
            iconChevronDown: <IconChevronDown />,
          },
        })}
      </Box>
    );
  },
);
