/**
 * SOLAR Slider.
 *
 * Written by hand, and never regenerated. What it looks like is not here. That is the recipe,
 * `solarSliderStyle` in `@bwp-web/styles/mui`: the rail, the fill by state, and the handle' size,
 * edge and shadow.
 *
 * One value in a continuous range, chosen by eye (a volume, a zoom): for an exact number, pair it
 * with a number input; for a range, use a Slider Range. `filled` and `error` are drawn as at rest,
 * as Figma draws them, until SOLAR draws them otherwise; `error` is announced. It wraps MUI's
 * Slider, which drags, takes the arrow keys and is announced as a slider (name it with
 * `aria-label`); on 0 to 100 by default, as MUI's is. It fills its container. The app must load
 * `@bwp-web/styles/tokens.css`.
 */

import { useSolarProps } from './internal/theme.js';
import MuiSlider, {
  type SliderProps as MuiSliderProps,
} from '@mui/material/Slider';
import { forwardRef } from 'react';
import { solarSliderStyle, type SolarSliderProps } from '@bwp-web/styles/mui';

export interface SliderProps
  extends
    SolarSliderProps,
    // MUI's value, onChange and the rest, typed for one value.
    Omit<
      MuiSliderProps<'span', object, number>,
      | keyof SolarSliderProps
      | 'color'
      | 'size'
      | 'marks'
      | 'track'
      | 'orientation'
      | 'ref'
    > {}

export const Slider = forwardRef<HTMLSpanElement, SliderProps>(
  function Slider(inProps, ref) {
    // As the app's MUI theme sets them (components.SolarSlider), under the caller's own.
    const {
      disabled = false,
      filled = false,
      error = false,
      sx,
      ...rest
    } = useSolarProps(inProps, 'SolarSlider');
    return (
      <MuiSlider
        ref={ref}
        {...rest}
        disabled={disabled}
        aria-invalid={error || undefined}
        sx={[
          solarSliderStyle({ disabled, filled, error }),
          ...(Array.isArray(sx) ? sx : [sx]),
        ]}
      />
    );
  },
);
