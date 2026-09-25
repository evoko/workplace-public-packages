/**
 * SOLAR Launch Card Full Screen.
 *
 * Written by hand, and never regenerated; its layer tree and slot names are the IR's,
 * `solarLaunchCardFullScreenTree` and `solarLaunchCardFullScreenSlots` beside the recipe. What it
 * looks like is not here. That is the recipe, `solarLaunchCardFullScreenStyle` and
 * `solarLaunchCardFullScreenCompose` in `@bwp-web/styles/mui`: the page’s fill, radius and padding,
 * its image’s frame, and its words’ ink.
 *
 * An app's page, where it is chosen from a launcher: its `image` beside its `appIcon` and
 * `favourite` (the caller's Icon Button, md, round and tertiary), its `name`, its `intro`, up to
 * three `features`, each a paragraph, and the caller's `action` (a SOLAR Button, md, "Open") at the
 * foot of its words. Bespoke: drawn from Figma's layer tree (`internal/layers.tsx`). The app must
 * load `@bwp-web/styles/tokens.css`.
 */

import { useSolarProps } from './internal/theme.js';
import Box, { type BoxProps } from '@mui/material/Box';
import { forwardRef, type ReactNode } from 'react';
import {
  solarLaunchCardFullScreenCompose,
  solarLaunchCardFullScreenStyle,
  type SolarLaunchCardFullScreenProps,
  solarLaunchCardFullScreenSlots,
  solarLaunchCardFullScreenTree,
} from '@bwp-web/styles/mui';
import { drawChildren } from './internal/layers.js';

export interface LaunchCardFullScreenProps
  extends
    SolarLaunchCardFullScreenProps,
    // MUI types BoxProps' ref for any element; the component's own comes from forwardRef.
    Omit<BoxProps, keyof SolarLaunchCardFullScreenProps | 'children' | 'ref'> {
  /** The app's name. */
  name: ReactNode;
  /** What the app is, its first paragraph. */
  intro?: ReactNode;
  /** What it does, up to three paragraphs, as Figma draws them. */
  features?: readonly [ReactNode?, ReactNode?, ReactNode?];
  /** The picture beside its words, by its address. */
  image?: string;
  /** The app's icon: an App Icon of the assets, as an image. */
  appIcon?: ReactNode;
  /** The caller's favourite: an Icon Button, md, round and tertiary. */
  favourite?: ReactNode;
  /** The caller's action: a SOLAR Button, md (“Open”). */
  action?: ReactNode;
}

export const LaunchCardFullScreen = forwardRef<
  HTMLDivElement,
  LaunchCardFullScreenProps
>(function LaunchCardFullScreen(inProps, ref) {
  // As the app's MUI theme sets them (components.SolarLaunchCardFullScreen), under the caller's own.
  const {
    name,
    intro,
    features,
    image,
    appIcon,
    favourite,
    action,
    sx,
    ...rest
  } = useSolarProps(inProps, 'SolarLaunchCardFullScreen');
  const composed = solarLaunchCardFullScreenCompose({});
  const parts = {
    ...composed,
    intro: {
      ...composed.intro,
      present: composed.intro?.present !== false && intro != null,
    },
    feature: {
      ...composed.feature,
      present: composed.feature?.present !== false && features?.[0] != null,
    },
    feature2: {
      ...composed.feature2,
      present: composed.feature2?.present !== false && features?.[1] != null,
    },
    feature3: {
      ...composed.feature3,
      present: composed.feature3?.present !== false && features?.[2] != null,
    },
    appIcon: { ...composed.appIcon, present: appIcon != null },
    favourite: { ...composed.favourite, present: favourite != null },
    action: { ...composed.action, present: action != null },
  };
  return (
    <Box
      component="div"
      ref={ref}
      {...rest}
      sx={[
        solarLaunchCardFullScreenStyle({}),
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      {drawChildren('root', {
        prefix: 'SolarLaunchCardFullScreen',
        tree: solarLaunchCardFullScreenTree,
        slots: solarLaunchCardFullScreenSlots,
        parts,
        text: {
          name,
          intro,
          feature: features?.[0],
          feature2: features?.[1],
          feature3: features?.[2],
        },
        content: { image: image != null ? <img src={image} alt="" /> : null },
        icons: {
          appIcon: <span>{appIcon}</span>,
          favourite: <span>{favourite}</span>,
          action: <span>{action}</span>,
        },
      })}
    </Box>
  );
});
