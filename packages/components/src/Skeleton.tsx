/**
 * SOLAR Skeleton.
 *
 * Scaffolded once by `npm run solar:scaffold Skeleton` from spec/components/skeleton.json, and
 * owned by developers from then on: change it freely. What it looks like is not here. That is the
 * recipe, `solarSkeletonStyle` in `@bwp-web/styles/mui`: each type's size and radius, and its
 * colour.
 *
 * It wraps MUI's Skeleton, always its rectangular variant (its text variant scales the box to 60%
 * of its height), which supplies the pulse, removed where motion is reduced. Figma's sizes are the
 * content's, for the three sizes; `width` and `height` take the real content's. Decorative: mark
 * the region loading with `aria-busy`. The app must load `@bwp-web/styles/tokens.css`.
 */

import MuiSkeleton, {
  type SkeletonProps as MuiSkeletonProps,
} from '@mui/material/Skeleton';
import { forwardRef } from 'react';
import {
  solarSkeletonStyle,
  type SolarSkeletonProps,
} from '@bwp-web/styles/mui';

export interface SkeletonProps
  extends
    SolarSkeletonProps,
    Omit<
      MuiSkeletonProps,
      | keyof SolarSkeletonProps
      | 'variant'
      | 'animation'
      // MUI types it Ref<unknown>; the component's own ref, a <span>, comes from forwardRef.
      | 'ref'
    > {}

export const Skeleton = forwardRef<HTMLSpanElement, SkeletonProps>(
  function Skeleton({ type, size, sx, ...rest }, ref) {
    return (
      <MuiSkeleton
        ref={ref}
        aria-hidden
        {...rest}
        variant="rectangular"
        animation="pulse"
        sx={[
          solarSkeletonStyle({ type, size }),
          ...(Array.isArray(sx) ? sx : [sx]),
        ]}
      />
    );
  },
);
