/**
 * SOLAR Scrim.
 *
 * Written by hand, and never regenerated. What it looks like is not here. That is the recipe,
 * `solarScrimStyle` in `@bwp-web/styles/mui`: `color.surface.scrim` over the whole viewport.
 *
 * The translucent layer behind a blocking surface, as the description says: MUI's Backdrop, which
 * the Dialog and the Drawer take as theirs. A click on it dismisses the surface above it, unless
 * that one is not dismissible (`onClick`, the surface's to give). Never decorative: it says the
 * user's attention is bound to the layer above it. The app must load `@bwp-web/styles/tokens.css`.
 */

import { useSolarProps } from './internal/theme.js';
import Backdrop, { type BackdropProps } from '@mui/material/Backdrop';
import { forwardRef } from 'react';
import { solarScrimStyle, type SolarScrimProps } from '@bwp-web/styles/mui';

export interface ScrimProps
  extends SolarScrimProps, Omit<BackdropProps, keyof SolarScrimProps | 'open'> {
  /** Whether it shows; shown by default, as a surface above it is. */
  open?: boolean;
}

export const Scrim = forwardRef<HTMLDivElement, ScrimProps>(
  function Scrim(inProps, ref) {
    // As the app's MUI theme sets them (components.SolarScrim), under the caller's own.
    const { open = true, sx, ...rest } = useSolarProps(inProps, 'SolarScrim');
    return (
      <Backdrop
        ref={ref}
        open={open}
        {...rest}
        sx={[solarScrimStyle({}), ...(Array.isArray(sx) ? sx : [sx])]}
      />
    );
  },
);
