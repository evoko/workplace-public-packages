/**
 * SOLAR Launch Card.
 *
 * Written by hand, and never regenerated; its layer tree and slot names are the IR's,
 * `solarLaunchCardTree` and `solarLaunchCardSlots` beside the recipe. What it looks like is not
 * here. That is the recipe, `solarLaunchCardStyle` and `solarLaunchCardCompose` in
 * `@bwp-web/styles/mui`: the card’s fill, edge, radius and focus ring, its image’s frame, and its
 * words’ ink.
 *
 * An app to open, on a launcher: its `image` (a picture across its top), its `appIcon` and `name`,
 * a `tag` (a SOLAR Tag's words), its `body`, and the caller's `actions` (a SOLAR Button Group: Open
 * and Learn more, or Request access). Its `favourite` (the caller's Icon Button, sm, round and
 * tertiary) sits on the image, or beside its name where it has none. Given `onClick` or `href`, it
 * is pressable: its name is the button or link, and its hit area the whole card, its actions and
 * favourite reachable above it; it is focused only then. Drawn from Figma's layer tree
 * (`internal/layers.tsx`). The app must load `@bwp-web/styles/tokens.css`.
 */

import { useSolarProps } from './internal/theme.js';
import Box, { type BoxProps } from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import { forwardRef, type MouseEvent, type ReactNode } from 'react';
import {
  solarLaunchCardCompose,
  solarLaunchCardStyle,
  type SolarLaunchCardProps,
  solarLaunchCardSlots,
  solarLaunchCardTree,
} from '@bwp-web/styles/mui';
import { drawChildren, type DrawnLayer } from './internal/layers.js';
import { Tag } from './Tag.js';

export interface LaunchCardProps
  extends
    SolarLaunchCardProps,
    // MUI types BoxProps' ref for any element; the component's own, a <div>, comes from forwardRef.
    Omit<
      BoxProps,
      | keyof SolarLaunchCardProps
      | 'name'
      | 'body'
      | 'appIcon'
      | 'tag'
      | 'actions'
      | 'favourite'
      | 'image'
      | 'onClick'
      | 'ref'
    > {
  /** The app’s name; its action’s name where it is pressable. */
  name: ReactNode;
  /** What it does, in a few lines. */
  body?: ReactNode;
  /** The app’s icon: an App Icon of the assets, as an image. */
  appIcon?: ReactNode;
  /** A SOLAR Tag’s words (“New”). */
  tag?: ReactNode;
  /** The caller’s actions: a SOLAR Button Group, horizontal. */
  actions?: ReactNode;
  /** The caller’s favourite, an Icon Button (sm, round, tertiary): on the image, or beside the name where it has none. */
  favourite?: ReactNode;
  /** The picture across its top, by its address. */
  image?: string;
  /** Makes it pressable: its name is a button that calls it. */
  onClick?: (event: MouseEvent<HTMLElement>) => void;
  /** Makes it pressable: its name is a link here. */
  href?: string;
}

export const LaunchCard = forwardRef<HTMLDivElement, LaunchCardProps>(
  function LaunchCard(inProps, ref) {
    // As the app's MUI theme sets them (components.SolarLaunchCard), under the caller's own.
    const {
      name,
      body,
      appIcon,
      tag,
      actions,
      favourite,
      image,
      onClick,
      href,
      className,
      sx,
      ...rest
    } = useSolarProps(inProps, 'SolarLaunchCard');
    const look = {};
    const composed = solarLaunchCardCompose(look);
    const pressable = onClick != null || href != null;
    // A slot left empty is not drawn, and one Figma hides at rest is drawn where it is given.
    const parts = {
      ...composed,
      bodyText: {
        ...composed.bodyText,
        present: composed.bodyText?.present !== false && body != null,
      },
      appIcon: {
        ...composed.appIcon,
        present: composed.appIcon?.present !== false && appIcon != null,
      },
      tag: { ...composed.tag, present: tag != null },
      actions: {
        ...composed.actions,
        present: composed.actions?.present !== false && actions != null,
      },
      image: {
        ...composed.image,
        present: composed.image?.present !== false && image != null,
      },
      favourite: {
        ...composed.favourite,
        present: favourite != null && image != null,
      },
      favouriteNoImage: {
        ...composed.favouriteNoImage,
        present: favourite != null && image == null,
      },
    };
    // Pressable, its name is its action, stretched over the card.
    const titled = pressable ? (
      <ButtonBase
        className="SolarLaunchCard-press"
        disableRipple
        {...(href != null ? { href } : {})}
        onClick={onClick}
      >
        {name}
      </ButtonBase>
    ) : (
      name
    );
    return (
      <>
        <Box
          ref={ref}
          className={
            [pressable ? 'SolarLaunchCard-pressable' : null, className]
              .filter(Boolean)
              .join(' ') || undefined
          }
          {...rest}
          sx={[solarLaunchCardStyle(look), ...(Array.isArray(sx) ? sx : [sx])]}
        >
          {drawChildren('root', {
            prefix: 'SolarLaunchCard',
            tree: solarLaunchCardTree,
            slots: solarLaunchCardSlots,
            parts,
            text: { name: titled, bodyText: body },
            icons: {
              appIcon: <span>{appIcon}</span>,
              actions: <span>{actions}</span>,
            },
            render: {
              // The picture fills the image, under the favourite.
              image: ({ className: c, style, children: drawn }: DrawnLayer) => (
                <span className={c} style={style}>
                  <img src={image} alt="" />
                  {drawn}
                </span>
              ),
              // The favourite, the caller's Icon Button, on the image or beside the name.
              favourite: ({ className: c, style }: DrawnLayer) => (
                <span className={c} style={style}>
                  {favourite}
                </span>
              ),
              favouriteNoImage: ({ className: c, style }: DrawnLayer) => (
                <span className={c} style={style}>
                  {favourite}
                </span>
              ),
              // A SOLAR Tag, as Figma draws it here: success, its words alone.
              tag: ({ className: c, style }: DrawnLayer) => (
                <span className={c} style={style}>
                  <Tag status="success">{tag}</Tag>
                </span>
              ),
            },
          })}
        </Box>
      </>
    );
  },
);
