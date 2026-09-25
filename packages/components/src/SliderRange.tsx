/**
 * SOLAR Slider Range.
 *
 * Written by hand, and never regenerated. What it looks like is not here. That is the recipe,
 * `solarSliderRangeStyle` in `@bwp-web/styles/mui`: the rail, the fill by state, and the handles'
 * size, edge and shadow.
 *
 * A range between two values, both of which matter (a price, a date span): show the two values
 * beside it, as SOLAR asks. For one value, use a Slider. It wraps MUI's Slider, which drags, takes
 * the arrow keys and is announced as a slider for each thumb (name each with `getAriaLabel`); on 0
 * to 100 by default, as MUI's is. It fills its container. The app must load
 * `@bwp-web/styles/tokens.css`.
 */

import { useSolarProps } from './internal/theme.js';
import MuiSlider, {
  type SliderProps as MuiSliderProps,
} from '@mui/material/Slider';
import { forwardRef } from 'react';
import {
  solarSliderRangeStyle,
  type SolarSliderRangeProps,
} from '@bwp-web/styles/mui';

export interface SliderRangeProps
  extends
    SolarSliderRangeProps,
    // MUI's value, onChange and the rest, typed for a pair.
    Omit<
      MuiSliderProps<'span', object, number[]>,
      | keyof SolarSliderRangeProps
      | 'color'
      | 'size'
      | 'marks'
      | 'track'
      | 'orientation'
      | 'ref'
    > {}

export const SliderRange = forwardRef<HTMLSpanElement, SliderRangeProps>(
  function SliderRange(inProps, ref) {
    // As the app's MUI theme sets them (components.SolarSliderRange), under the caller's own.
    const {
      disabled = false,
      sx,
      ...rest
    } = useSolarProps(inProps, 'SolarSliderRange');
    return (
      <MuiSlider
        ref={ref}
        {...rest}
        disabled={disabled}
        sx={[
          solarSliderRangeStyle({ disabled }),
          ...(Array.isArray(sx) ? sx : [sx]),
        ]}
      />
    );
  },
);
