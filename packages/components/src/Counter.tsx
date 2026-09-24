/**
 * SOLAR Counter.
 *
 * Scaffolded once by `npm run solar:scaffold Counter` from spec/components/counter.json, and owned
 * by developers from then on: change it freely. What it looks like is not here. That is the recipe,
 * `solarCounterStyle` and `solarCounterCompose` in `@bwp-web/styles/mui`: the pill’s fill, border
 * and padding, and the count’s text style, by type and state.
 *
 * Bespoke: a count on a pill, drawn from Figma’s layer tree (`internal/layers.tsx`). It takes the
 * states of the control it sits in, so in a Button it follows the Button’s hover, press and
 * disabled colours, as Figma draws it; given `onClick`, it is a <button> of its own. A count of 0
 * or less draws nothing, and one above `max` reads `<max>+`, as SOLAR says. The app must load
 * `@bwp-web/styles/tokens.css`.
 */

import Box, { type BoxProps } from '@mui/material/Box';
import { forwardRef } from 'react';
import {
  solarCounterCompose,
  solarCounterStyle,
  type SolarCounterProps,
} from '@bwp-web/styles/mui';
import { drawChildren } from './internal/layers.js';

/** Each layer's children, as Figma nests them. */
const TREE: Record<string, string[]> = { root: ['value'] };

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

export const Counter = forwardRef<HTMLElement, CounterProps>(function Counter(
  { type, disabled, count, max = 99, onClick, className, sx, ...rest },
  ref,
) {
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
        tree: TREE,
        parts,
        text: { value: count > max ? `${max}+` : String(count) },
      })}
    </Box>
  );
});
