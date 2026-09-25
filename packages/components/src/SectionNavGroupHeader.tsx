/**
 * SOLAR Section Nav Group Header.
 *
 * Written by hand, and never regenerated; its layer tree and slot names are the IR's,
 * `solarSectionNavGroupHeaderTree` and `solarSectionNavGroupHeaderSlots` beside the recipe. What it
 * looks like is not here. That is the recipe, `solarSectionNavGroupHeaderStyle` and
 * `solarSectionNavGroupHeaderCompose` in `@bwp-web/styles/mui`: its words’ text style and ink, and
 * its padding.
 *
 * Bespoke: the heading of a group of SectionNavItems in a section nav rail, drawn from Figma's
 * layer tree (`internal/layers.tsx`), not interactive, and announced as a heading (`level`, 3 by
 * default) so a screen reader names the group, as its description asks. Its words are its children.
 * The app must load `@bwp-web/styles/tokens.css`.
 */

import { useSolarProps } from './internal/theme.js';
import Box, { type BoxProps } from '@mui/material/Box';
import { forwardRef, type ReactNode } from 'react';
import {
  solarSectionNavGroupHeaderCompose,
  solarSectionNavGroupHeaderStyle,
  type SolarSectionNavGroupHeaderProps,
  solarSectionNavGroupHeaderSlots,
  solarSectionNavGroupHeaderTree,
} from '@bwp-web/styles/mui';
import { drawChildren } from './internal/layers.js';

export interface SectionNavGroupHeaderProps
  extends
    SolarSectionNavGroupHeaderProps,
    // MUI types BoxProps' ref for any element; the component's own comes from forwardRef.
    Omit<BoxProps, keyof SolarSectionNavGroupHeaderProps | 'children' | 'ref'> {
  /** The group's name. */
  children: ReactNode;
  /** Its heading level, for a screen reader. */
  level?: 1 | 2 | 3 | 4 | 5 | 6;
}

export const SectionNavGroupHeader = forwardRef<
  HTMLDivElement,
  SectionNavGroupHeaderProps
>(function SectionNavGroupHeader(inProps, ref) {
  // As the app's MUI theme sets them (components.SolarSectionNavGroupHeader), under the caller's own.
  const {
    children,
    level = 3,
    sx,
    ...rest
  } = useSolarProps(inProps, 'SolarSectionNavGroupHeader');
  const parts = solarSectionNavGroupHeaderCompose({});
  return (
    <Box
      component="div"
      ref={ref}
      role="heading"
      aria-level={level}
      {...rest}
      sx={[
        solarSectionNavGroupHeaderStyle({}),
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      {drawChildren('root', {
        prefix: 'SolarSectionNavGroupHeader',
        tree: solarSectionNavGroupHeaderTree,
        slots: solarSectionNavGroupHeaderSlots,
        parts,
        text: { label: children },
      })}
    </Box>
  );
});
