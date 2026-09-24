/**
 * SOLAR ProgressBar.
 *
 * Scaffolded once by `npm run solar:scaffold ProgressBar` from spec/components/progressbar.json,
 * and owned by developers from then on: change it freely. What it looks like is not here. That is
 * the recipe, `solarProgressBarStyle` in `@bwp-web/styles/mui`: the track's colour and height,
 * and the bar's colour by feedback.
 *
 * It wraps MUI's determinate LinearProgress, which draws the bar at `value` (0 to 100) and
 * supplies the progressbar role: name it (`aria-label`), and say the number beside it, as SOLAR
 * asks. It fills its container. The app must load `@bwp-web/styles/tokens.css`.
 */

import LinearProgress, {
  type LinearProgressProps,
} from '@mui/material/LinearProgress';
import { forwardRef } from 'react';
import {
  solarProgressBarStyle,
  type SolarProgressBarProps,
} from '@bwp-web/styles/mui';

export interface ProgressBarProps
  extends
    SolarProgressBarProps,
    Omit<
      LinearProgressProps,
      | keyof SolarProgressBarProps
      | 'variant'
      | 'color'
      | 'value'
      | 'valueBuffer'
      // MUI types it Ref<unknown>; the component's own ref, a <span>, comes from forwardRef.
      | 'ref'
    > {
  /** How far along, from 0 to 100. */
  value: number;
}

export const ProgressBar = forwardRef<HTMLSpanElement, ProgressBarProps>(
  function ProgressBar({ feedback, value, sx, ...rest }, ref) {
    return (
      <LinearProgress
        ref={ref}
        {...rest}
        variant="determinate"
        value={value}
        sx={[
          solarProgressBarStyle({ feedback }),
          ...(Array.isArray(sx) ? sx : [sx]),
        ]}
      />
    );
  },
);
