/**
 * SOLAR Counter.
 *
 * Written by hand, and never regenerated; its layer tree and slot names are the IR's,
 * `solarCounterTree` and `solarCounterSlots` beside the recipe. What it looks like is not here.
 * That is the recipe, `solarCounterStyle` and `solarCounterCompose` in `@bwp-web/styles/mui`: the
 * pill’s fill, border and padding, and the count’s text style, by type and state.
 *
 * Bespoke: a count on a pill, drawn from Figma’s layer tree (`internal/layers.tsx`). It takes the
 * states of the control it sits in, so in a Button it follows the Button’s hover, press and
 * disabled colours, as Figma draws it; given `onClick`, it is a <button> of its own. A count of 0
 * or less draws nothing, and one above `max` reads `<max>+`, as SOLAR says. The app must load
 * `@bwp-web/styles/tokens.css`.
 */

import { useSolarProps } from './internal/theme.js';
import Box, { type BoxProps } from '@mui/material/Box';
import { forwardRef } from 'react';
import {
  solarCounterCompose,
  solarCounterStyle,
  type SolarCounterProps,
  solarCounterSlots,
  solarCounterTree,
} from '@bwp-web/styles/mui';
import { drawChildren } from './internal/layers.js';

export interface CounterProps
  extends
    SolarCounterProps,
    // MUI types BoxProps' ref for any element; the component's own comes from forwardRef.
    Omit<BoxProps, keyof SolarCounterProps | 'children' | 'ref'> {
  /** The count. At 0 or below the counter is not drawn: SOLAR never shows a literal 0. */
  count: number;
  /** The largest count shown as a number; above it the counter reads `<max>+`. 99 by default. */
  max?: number;
}

export const Counter = forwardRef<HTMLElement, CounterProps>(
  function Counter(inProps, ref) {
    // As the app's MUI theme sets them (components.SolarCounter), under the caller's own.
    const {
      type,
      disabled,
      count,
      max = 99,
      onClick,
      className,
      sx,
      ...rest
    } = useSolarProps(inProps, 'SolarCounter');
    if (count <= 0) return null;
    const parts = solarCounterCompose({ type, disabled });
    return (
      <Box
        component={onClick ? 'button' : 'span'}
        ref={ref}
        onClick={onClick}
        type={onClick ? 'button' : undefined}
        disabled={onClick ? disabled : undefined}
        className={
          [disabled ? 'SolarCounter-disabled' : null, className]
            .filter(Boolean)
            .join(' ') || undefined
        }
        {...rest}
        sx={[
          solarCounterStyle({ type, disabled }),
          ...(Array.isArray(sx) ? sx : [sx]),
        ]}
      >
        {drawChildren('root', {
          prefix: 'SolarCounter',
          tree: solarCounterTree,
          slots: solarCounterSlots,
          parts,
          text: { value: count > max ? `${max}+` : String(count) },
        })}
      </Box>
    );
  },
);
