/**
 * SOLAR Spinner.
 *
 * Scaffolded once by `npm run solar:scaffold Spinner` from spec/components/spinner.json, and owned
 * by developers from then on. Its look is the recipe, `solarSpinnerStyle` in
 * `@bwp-web/styles/mui`: the ring's size, its stroke width, and the track and indicator colours.
 *
 * It wraps MUI's CircularProgress, which supplies the motion and the progressbar role. A box takes
 * the recipe's size and the progress fills it, because MUI writes its own size prop as an inline
 * style the recipe could not override. The app must load `@bwp-web/styles/tokens.css`.
 */

import Box from '@mui/material/Box';
import CircularProgress, {
  type CircularProgressProps,
} from '@mui/material/CircularProgress';
import { forwardRef } from 'react';
import { solarSpinnerStyle, type SolarSpinnerProps } from '@bwp-web/styles/mui';

export interface SpinnerProps
  extends
    SolarSpinnerProps,
    Omit<
      CircularProgressProps,
      | keyof SolarSpinnerProps
      | 'color'
      | 'thickness'
      | 'value'
      | 'enableTrackSlot'
      | 'disableShrink'
      // MUI types it Ref<unknown>; the component's own ref, a <span>, comes from forwardRef.
      | 'ref'
    > {}

export const Spinner = forwardRef<HTMLSpanElement, SpinnerProps>(
  function Spinner({ size, variant, sx, ...rest }, ref) {
    return (
      <Box
        component="span"
        ref={ref}
        sx={[
          solarSpinnerStyle({ size, variant }),
          ...(Array.isArray(sx) ? sx : [sx]),
        ]}
      >
        <CircularProgress
          {...rest}
          size="100%"
          enableTrackSlot
          color="inherit"
        />
      </Box>
    );
  },
);
