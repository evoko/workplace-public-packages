/**
 * SOLAR PaginationEllipsis.
 *
 * Written by hand, and never regenerated; its layer tree and slot names are the IR's,
 * `solarPaginationEllipsisTree` and `solarPaginationEllipsisSlots` beside the recipe. What it looks
 * like is not here. That is the recipe, `solarPaginationEllipsisStyle` and
 * `solarPaginationEllipsisCompose` in `@bwp-web/styles/mui`: its box and its words’ text style and
 * ink.
 *
 * Bespoke: the gap in a Pagination's pages, an ellipsis drawn from Figma's layer tree
 * (`internal/layers.tsx`): static text, never a control, as its description says ("Ellipsis is
 * static text, never a 'jump' trigger"). The app must load `@bwp-web/styles/tokens.css`.
 */

import { useSolarProps } from './internal/theme.js';
import Box, { type BoxProps } from '@mui/material/Box';
import { forwardRef } from 'react';
import {
  solarPaginationEllipsisCompose,
  solarPaginationEllipsisStyle,
  type SolarPaginationEllipsisProps,
  solarPaginationEllipsisSlots,
  solarPaginationEllipsisTree,
} from '@bwp-web/styles/mui';
import { drawChildren } from './internal/layers.js';

export interface PaginationEllipsisProps
  extends
    SolarPaginationEllipsisProps,
    // MUI types BoxProps' ref for any element; the component's own comes from forwardRef.
    Omit<BoxProps, keyof SolarPaginationEllipsisProps | 'children' | 'ref'> {}

export const PaginationEllipsis = forwardRef<
  HTMLSpanElement,
  PaginationEllipsisProps
>(function PaginationEllipsis(inProps, ref) {
  // As the app's MUI theme sets them (components.SolarPaginationEllipsis), under the caller's own.
  const { sx, ...rest } = useSolarProps(inProps, 'SolarPaginationEllipsis');
  const parts = solarPaginationEllipsisCompose({});
  return (
    <Box
      component="span"
      ref={ref}
      {...rest}
      sx={[
        solarPaginationEllipsisStyle({}),
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      {drawChildren('root', {
        prefix: 'SolarPaginationEllipsis',
        tree: solarPaginationEllipsisTree,
        slots: solarPaginationEllipsisSlots,
        parts,
        text: { label: '…' },
      })}
    </Box>
  );
});
