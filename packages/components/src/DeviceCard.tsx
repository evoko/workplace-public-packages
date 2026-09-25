/**
 * SOLAR Device Card.
 *
 * Written by hand, and never regenerated; its layer tree and slot names are the IR's,
 * `solarDeviceCardTree` and `solarDeviceCardSlots` beside the recipe. What it looks like is not
 * here. That is the recipe, `solarDeviceCardStyle` and `solarDeviceCardCompose` in
 * `@bwp-web/styles/mui`: the card’s fill, edge and focus ring, each type’s layout, its words’ and
 * icons’ ink, and the placeholders.
 *
 * One device, or a batch of them (`type`): its `name`, and for one device its `details` (what and
 * where it is), for a batch its `count` and the caller's `devices` (a SOLAR Dropdown of them, md);
 * its health, a SOLAR Tag of `tag`'s words in `tagStatus` (success by default), and the caller's
 * `action` (a SOLAR Button, sm and secondary, such as "Try again"). `loading` draws Figma's
 * placeholders, announced busy. Given `onClick` or `href`, it is pressable: its name is the button
 * or link, and its hit area the whole card, its action and devices reachable above it; it is
 * focused only then. Drawn from Figma's layer tree (`internal/layers.tsx`). The app must load
 * `@bwp-web/styles/tokens.css`.
 */

import { useSolarProps } from './internal/theme.js';
import Box, { type BoxProps } from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import { IconDevice, IconProgress } from '@bwp-web/assets';
import { forwardRef, type MouseEvent, type ReactNode } from 'react';
import {
  solarDeviceCardCompose,
  solarDeviceCardStyle,
  type SolarDeviceCardProps,
  solarDeviceCardSlots,
  solarDeviceCardTree,
} from '@bwp-web/styles/mui';
import { drawChildren, type DrawnLayer } from './internal/layers.js';
import { Tag, type TagProps } from './Tag.js';

export interface DeviceCardProps
  extends
    SolarDeviceCardProps,
    // MUI types BoxProps' ref for any element; the component's own, a <div>, comes from forwardRef.
    Omit<
      BoxProps,
      | keyof SolarDeviceCardProps
      | 'name'
      | 'details'
      | 'count'
      | 'tag'
      | 'tagStatus'
      | 'action'
      | 'devices'
      | 'onClick'
      | 'ref'
    > {
  /** The device’s or the batch’s name; its action’s name where it is pressable. */
  name: ReactNode;
  /** What and where it is, in a line. */
  details?: ReactNode;
  /** How many a batch holds (“3 devices”). */
  count?: ReactNode;
  /** Its health, in a SOLAR Tag’s words. */
  tag?: ReactNode;
  /** The health’s status; success by default. */
  tagStatus?: TagProps['status'];
  /** The caller’s action: a SOLAR Button, sm and secondary (“Try again”). */
  action?: ReactNode;
  /** A batch’s devices: the caller’s SOLAR Dropdown, md. */
  devices?: ReactNode;
  /** Makes it pressable: its name is a button that calls it. */
  onClick?: (event: MouseEvent<HTMLElement>) => void;
  /** Makes it pressable: its name is a link here. */
  href?: string;
}

export const DeviceCard = forwardRef<HTMLDivElement, DeviceCardProps>(
  function DeviceCard(inProps, ref) {
    // As the app's MUI theme sets them (components.SolarDeviceCard), under the caller's own.
    const {
      loading = false,
      type = 'single',
      name,
      details,
      count,
      tag,
      tagStatus,
      action,
      devices,
      onClick,
      href,
      className,
      sx,
      ...rest
    } = useSolarProps(inProps, 'SolarDeviceCard');
    const look = { loading, type };
    const composed = solarDeviceCardCompose(
      look,
      loading ? 'loading' : 'default',
    );
    // Pressable while it loads too, as Figma draws a loading card hovered: its title, the action,
    // is then its name alone.
    const pressable = onClick != null || href != null;
    // A slot left empty is not drawn, and one Figma hides at rest is drawn where it is given.
    const parts = {
      ...composed,
      details: {
        ...composed.details,
        present: composed.details?.present !== false && details != null,
      },
      contentCount: {
        ...composed.contentCount,
        present: composed.contentCount?.present !== false && count != null,
      },
      rowCount: {
        ...composed.rowCount,
        present: composed.rowCount?.present !== false && count != null,
      },
      tag: {
        ...composed.tag,
        present: composed.tag?.present !== false && tag != null,
      },
      headlineTag: {
        ...composed.headlineTag,
        present: composed.headlineTag?.present !== false && tag != null,
      },
      button: { ...composed.button, present: action != null },
      devices: {
        ...composed.devices,
        present: composed.devices?.present !== false && devices != null,
      },
    };
    // Pressable, its name is its action, stretched over the card.
    const titled = pressable ? (
      <ButtonBase
        className="SolarDeviceCard-press"
        disableRipple
        {...(href != null ? { href } : {})}
        onClick={onClick}
      >
        {name}
      </ButtonBase>
    ) : (
      name
    );
    // Loading, where its title is not drawn (Card's; a Device Card's is), the action is drawn in
    // its place, its name alone.
    const waiting =
      pressable &&
      loading &&
      !['contentName', 'headlineContentName', 'rowName'].some(
        (l) => composed[l]?.present !== false,
      ) ? (
        <ButtonBase
          className="SolarDeviceCard-press"
          disableRipple
          {...(href != null ? { href } : {})}
          onClick={onClick}
        >
          <span className="SolarDeviceCard-name">{name}</span>
        </ButtonBase>
      ) : null;
    return (
      <>
        <Box
          ref={ref}
          aria-busy={loading || undefined}
          className={
            [
              pressable ? 'SolarDeviceCard-pressable' : null,
              loading ? 'SolarDeviceCard-loading' : null,
              className,
            ]
              .filter(Boolean)
              .join(' ') || undefined
          }
          {...rest}
          sx={[solarDeviceCardStyle(look), ...(Array.isArray(sx) ? sx : [sx])]}
        >
          {waiting}
          {drawChildren('root', {
            prefix: 'SolarDeviceCard',
            tree: solarDeviceCardTree,
            slots: solarDeviceCardSlots,
            parts,
            text: {
              headlineContentName: titled,
              rowName: titled,
              contentName: titled,
              details,
              contentCount: count,
              rowCount: count,
            },
            icons: {
              iconIconDevice: <IconDevice />,
              iconIconProgress: <IconProgress />,
              headlineIconIconDevice: <IconDevice />,
              headlineIconIconProgress: <IconProgress />,
              button: <span>{action}</span>,
              devices: <span>{devices}</span>,
            },
            render: {
              // Its health, a SOLAR Tag in the status the caller gives, with its dot on one device's card.
              tag: ({ className: c, style }: DrawnLayer) => (
                <span className={c} style={style}>
                  <Tag status={tagStatus ?? 'success'} indicator>
                    {tag}
                  </Tag>
                </span>
              ),
              headlineTag: ({ className: c, style }: DrawnLayer) => (
                <span className={c} style={style}>
                  <Tag status={tagStatus ?? 'success'}>{tag}</Tag>
                </span>
              ),
            },
          })}
        </Box>
      </>
    );
  },
);
