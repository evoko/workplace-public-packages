/**
 * SOLAR Split Dropdown.
 *
 * Written by hand, and never regenerated; its layer tree and slot names are the IR's,
 * `solarSplitDropdownTree` and `solarSplitDropdownSlots` beside the recipe. What it looks like is
 * not here. That is the recipe, `solarSplitDropdownStyle` and `solarSplitDropdownCompose` in
 * `@bwp-web/styles/mui`: its edge and radius, and each zone’s fill and padding.
 *
 * A box of two zones pairing a primary control with supporting details: the `top` (the control) on
 * the raised surface, and the `lower` strip (the details) tinted under it. Nothing in it opens or
 * toggles: each zone is the caller's. Bespoke: drawn from Figma's layer tree
 * (`internal/layers.tsx`). The app must load `@bwp-web/styles/tokens.css`.
 */

import { useSolarProps } from './internal/theme.js';
import Box, { type BoxProps } from '@mui/material/Box';
import { forwardRef, type ReactNode } from 'react';
import {
  solarSplitDropdownCompose,
  solarSplitDropdownStyle,
  type SolarSplitDropdownProps,
  solarSplitDropdownSlots,
  solarSplitDropdownTree,
} from '@bwp-web/styles/mui';
import { drawChildren } from './internal/layers.js';

export interface SplitDropdownProps
  extends
    SolarSplitDropdownProps,
    // MUI types BoxProps' ref for any element; the component's own comes from forwardRef.
    Omit<BoxProps, keyof SolarSplitDropdownProps | 'children' | 'ref'> {
  /** The top zone's content: the primary control. */
  top?: ReactNode;
  /** The lower strip's content: the supporting details. */
  lower?: ReactNode;
}

export const SplitDropdown = forwardRef<HTMLDivElement, SplitDropdownProps>(
  function SplitDropdown(inProps, ref) {
    // As the app's MUI theme sets them (components.SolarSplitDropdown), under the caller's own.
    const { top, lower, sx, ...rest } = useSolarProps(
      inProps,
      'SolarSplitDropdown',
    );
    const parts = solarSplitDropdownCompose({});
    return (
      <Box
        component="div"
        ref={ref}
        {...rest}
        sx={[solarSplitDropdownStyle({}), ...(Array.isArray(sx) ? sx : [sx])]}
      >
        {drawChildren('root', {
          prefix: 'SolarSplitDropdown',
          tree: solarSplitDropdownTree,
          slots: solarSplitDropdownSlots,
          parts,
          content: { topContent: <>{top}</>, lowerContent: <>{lower}</> },
        })}
      </Box>
    );
  },
);
