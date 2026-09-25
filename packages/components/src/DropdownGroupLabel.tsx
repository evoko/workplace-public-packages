/**
 * SOLAR Dropdown Group Label.
 *
 * Written by hand, and never regenerated; its layer tree and slot names are the IR's,
 * `solarDropdownGroupLabelTree` and `solarDropdownGroupLabelSlots` beside the recipe. What it looks
 * like is not here. That is the recipe, `solarDropdownGroupLabelStyle` and
 * `solarDropdownGroupLabelCompose` in `@bwp-web/styles/mui`: the heading’s fill, padding and text
 * style, by size.
 *
 * Bespoke: a section's heading in a DropdownMenu ("Recent", "All projects"), drawn from Figma’s
 * layer tree (`internal/layers.tsx`) as one of the menu's list items, presentational, so the menu's
 * keyboard passes over it to the rows. In a menu it takes the menu's size. SOLAR says to use it
 * only where a menu has three or more kinds of row. The app must load `@bwp-web/styles/tokens.css`.
 */

import { useSolarProps } from './internal/theme.js';
import Box, { type BoxProps } from '@mui/material/Box';
import { useDropdownMenuSize } from './DropdownMenu.js';
import { forwardRef, type ReactNode } from 'react';
import {
  solarDropdownGroupLabelCompose,
  solarDropdownGroupLabelStyle,
  type SolarDropdownGroupLabelProps,
  solarDropdownGroupLabelSlots,
  solarDropdownGroupLabelTree,
} from '@bwp-web/styles/mui';
import { drawChildren } from './internal/layers.js';

export interface DropdownGroupLabelProps
  extends
    SolarDropdownGroupLabelProps,
    // MUI types BoxProps' ref for any element; the component's own comes from forwardRef.
    Omit<BoxProps, keyof SolarDropdownGroupLabelProps | 'children' | 'ref'> {
  /** The heading's words. */
  children: ReactNode;
}

export const DropdownGroupLabel = forwardRef<
  HTMLLIElement,
  DropdownGroupLabelProps
>(function DropdownGroupLabel(inProps, ref) {
  // As the app's MUI theme sets them (components.SolarDropdownGroupLabel), under the caller's own.
  const {
    size: sizeGiven,
    children,
    sx,
    ...rest
  } = useSolarProps(inProps, 'SolarDropdownGroupLabel');
  let size = sizeGiven;
  // In a menu, the menu's size, as Figma draws its rows.
  size = useDropdownMenuSize() ?? size;
  const parts = solarDropdownGroupLabelCompose({ size });
  return (
    <Box
      component="li"
      ref={ref}
      role="presentation"
      {...rest}
      sx={[
        solarDropdownGroupLabelStyle({ size }),
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      {drawChildren('root', {
        prefix: 'SolarDropdownGroupLabel',
        tree: solarDropdownGroupLabelTree,
        slots: solarDropdownGroupLabelSlots,
        parts,
        text: { groupLabel: children },
      })}
    </Box>
  );
});
