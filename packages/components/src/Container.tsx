/**
 * SOLAR Container.
 *
 * Written by hand, and never regenerated; its layer tree and slot names are the IR's,
 * `solarContainerTree` and `solarContainerSlots` beside the recipe. What it looks like is not here.
 * That is the recipe, `solarContainerStyle` and `solarContainerCompose` in `@bwp-web/styles/mui`:
 * its padding and gap, and the outlined one’s surface, edge and shadow.
 *
 * A region grouping related content inside a larger surface (a card's body, a dialog's, a part of a
 * page): the caller's content, padded, with no paint of its own (`default`) or on a raised surface
 * with an edge (`outlined`). No control, and no card: for a raised surface of its own use a Card.
 * Bespoke: drawn from Figma's layer tree (`internal/layers.tsx`). The app must load
 * `@bwp-web/styles/tokens.css`.
 */

import { useSolarProps } from './internal/theme.js';
import Box, { type BoxProps } from '@mui/material/Box';
import { forwardRef, type ReactNode } from 'react';
import {
  solarContainerCompose,
  solarContainerStyle,
  type SolarContainerProps,
  solarContainerSlots,
  solarContainerTree,
} from '@bwp-web/styles/mui';
import { drawChildren } from './internal/layers.js';

export interface ContainerProps
  extends
    SolarContainerProps,
    // MUI types BoxProps' ref for any element; the component's own comes from forwardRef.
    Omit<BoxProps, keyof SolarContainerProps | 'children' | 'ref'> {
  /** What it groups. */
  children?: ReactNode;
}

export const Container = forwardRef<HTMLDivElement, ContainerProps>(
  function Container(inProps, ref) {
    // As the app's MUI theme sets them (components.SolarContainer), under the caller's own.
    const { type, children, sx, ...rest } = useSolarProps(
      inProps,
      'SolarContainer',
    );
    const parts = solarContainerCompose({ type });
    return (
      <Box
        component="div"
        ref={ref}
        {...rest}
        sx={[solarContainerStyle({ type }), ...(Array.isArray(sx) ? sx : [sx])]}
      >
        {drawChildren('root', {
          prefix: 'SolarContainer',
          tree: solarContainerTree,
          slots: solarContainerSlots,
          parts,
          content: { content: <>{children}</> },
        })}
      </Box>
    );
  },
);
