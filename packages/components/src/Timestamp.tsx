/**
 * SOLAR Timestamp.
 *
 * Written by hand, and never regenerated; its layer tree and slot names are the IR's,
 * `solarTimestampTree` and `solarTimestampSlots` beside the recipe. What it looks like is not here.
 * That is the recipe, `solarTimestampStyle` and `solarTimestampCompose` in `@bwp-web/styles/mui`:
 * its text style and colour, by size and emphasis.
 *
 * Bespoke: a time in words, drawn as HTML’s <time> from Figma’s layer tree (`internal/layers.tsx`).
 * The words are the app’s, formatted in the user’s locale and timezone (relative, ‘2 min ago’;
 * absolute, ‘Apr 18, 2026, 14:32’); `format` says which they are, and `dateTime` is the moment,
 * machine-readable. For `combined`, `detail` is the absolute time the words abbreviate, shown on
 * hover. The app must load `@bwp-web/styles/tokens.css`.
 */

import { useSolarProps } from './internal/theme.js';
import Box, { type BoxProps } from '@mui/material/Box';
import { forwardRef, type ReactNode } from 'react';
import {
  solarTimestampCompose,
  solarTimestampStyle,
  type SolarTimestampProps,
  solarTimestampSlots,
  solarTimestampTree,
} from '@bwp-web/styles/mui';
import { drawChildren } from './internal/layers.js';

export interface TimestampProps
  extends
    SolarTimestampProps,
    // MUI types BoxProps' ref for any element; the component's own comes from forwardRef.
    Omit<BoxProps, keyof SolarTimestampProps | 'children' | 'ref'> {
  /** The moment the words describe, written into the page for machines (`<time datetime>`). */
  dateTime: Date | string;
  /** The words for it, which the app formats in the user's locale and timezone. */
  children: ReactNode;
  /** For `combined`: the absolute time the words abbreviate, shown on hover. */
  detail?: string;
}

export const Timestamp = forwardRef<HTMLTimeElement, TimestampProps>(
  function Timestamp(inProps, ref) {
    // As the app's MUI theme sets them (components.SolarTimestamp), under the caller's own.
    const { format, size, emphasis, dateTime, children, detail, sx, ...rest } =
      useSolarProps(inProps, 'SolarTimestamp');
    const parts = solarTimestampCompose({ format, size, emphasis });
    return (
      <Box
        component="time"
        ref={ref}
        dateTime={
          typeof dateTime === 'string' ? dateTime : dateTime.toISOString()
        }
        title={detail}
        {...rest}
        sx={[
          solarTimestampStyle({ format, size, emphasis }),
          ...(Array.isArray(sx) ? sx : [sx]),
        ]}
      >
        {drawChildren('root', {
          prefix: 'SolarTimestamp',
          tree: solarTimestampTree,
          slots: solarTimestampSlots,
          parts,
          text: { value: children },
        })}
      </Box>
    );
  },
);
