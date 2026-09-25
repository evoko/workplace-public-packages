/**
 * SOLAR Kbd.
 *
 * Written by hand, and never regenerated; its layer tree and slot names are the IR's,
 * `solarKbdTree` and `solarKbdSlots` beside the recipe. What it looks like is not here. That is the
 * recipe, `solarKbdStyle` and `solarKbdCompose` in `@bwp-web/styles/mui`: the key cap’s fill,
 * border and radius, and its label’s text style.
 *
 * Bespoke: a key cap, drawn as HTML’s <kbd> from Figma’s layer tree (`internal/layers.tsx`). One
 * key per Kbd: a chord is several, with a separator between them (Ctrl + K), and a modifier is the
 * platform’s own symbol (⌘ on macOS, Ctrl elsewhere). The app must load
 * `@bwp-web/styles/tokens.css`.
 */

import { useSolarProps } from './internal/theme.js';
import Box, { type BoxProps } from '@mui/material/Box';
import { forwardRef, type ReactNode } from 'react';
import {
  solarKbdCompose,
  solarKbdStyle,
  type SolarKbdProps,
  solarKbdSlots,
  solarKbdTree,
} from '@bwp-web/styles/mui';
import { drawChildren } from './internal/layers.js';

export interface KbdProps
  extends
    SolarKbdProps,
    // MUI types BoxProps' ref for any element; the component's own comes from forwardRef.
    Omit<BoxProps, keyof SolarKbdProps | 'children' | 'ref'> {
  /** The key's label: one key, as the platform names it (⌘, Ctrl, K, Enter). */
  children: ReactNode;
}

export const Kbd = forwardRef<HTMLElement, KbdProps>(
  function Kbd(inProps, ref) {
    // As the app's MUI theme sets them (components.SolarKbd), under the caller's own.
    const { type, children, sx, ...rest } = useSolarProps(inProps, 'SolarKbd');
    const parts = solarKbdCompose({ type });
    return (
      <Box
        component="kbd"
        ref={ref}
        {...rest}
        sx={[solarKbdStyle({ type }), ...(Array.isArray(sx) ? sx : [sx])]}
      >
        {drawChildren('root', {
          prefix: 'SolarKbd',
          tree: solarKbdTree,
          slots: solarKbdSlots,
          parts,
          text: { label: children },
        })}
      </Box>
    );
  },
);
