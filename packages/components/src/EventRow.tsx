/**
 * SOLAR Event Row.
 *
 * Written by hand, and never regenerated; its layer tree and slot names are the IR's,
 * `solarEventRowTree` and `solarEventRowSlots` beside the recipe. What it looks like is not here.
 * That is the recipe, `solarEventRowStyle` and `solarEventRowCompose` in `@bwp-web/styles/mui`: the
 * row’s fill and focus ring by state, its words’ ink and the More icon’s.
 *
 * One event of an activity feed (stack them in an ordered list, newest first): who or what did it
 * (`leading`, an Avatar md for a person, an icon for a system or device), what happened (`title`),
 * the product it was in (`product`) and its context (`meta`), when (`timestamp`, the words, with
 * `dateTime` the moment, for a `<time>`), and a More menu of `moreItems`. Given `onClick` or
 * `href`, it is pressable: its title is the button or link, and its hit area the whole row, the
 * More menu reachable above it; it is hovered and focused only then. Drawn from Figma's layer tree
 * (`internal/layers.tsx`). The app must load `@bwp-web/styles/tokens.css`.
 */

import { useSolarProps } from './internal/theme.js';
import Box, { type BoxProps } from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import { IconMore } from '@bwp-web/assets';
import {
  forwardRef,
  useRef,
  useState,
  type MouseEvent,
  type ReactNode,
} from 'react';
import {
  solarEventRowCompose,
  solarEventRowStyle,
  type SolarEventRowProps,
  solarEventRowSlots,
  solarEventRowTree,
} from '@bwp-web/styles/mui';
import type { CardMoreItem } from './Card.js';
import { DropdownItem } from './DropdownItem.js';
import { DropdownMenu } from './DropdownMenu.js';
import { drawChildren } from './internal/layers.js';

export interface EventRowProps
  extends
    SolarEventRowProps,
    // MUI types BoxProps' ref for any element; the component's own, a <div>, comes from forwardRef.
    Omit<
      BoxProps,
      | keyof SolarEventRowProps
      | 'title'
      | 'leading'
      | 'product'
      | 'meta'
      | 'timestamp'
      | 'dateTime'
      | 'onClick'
      | 'ref'
    > {
  /** What happened, in a few words; its action’s name where it is pressable. */
  title: ReactNode;
  /** Who or what did it: a SOLAR Avatar, md, or an icon. */
  leading?: ReactNode;
  /** The product it was in. */
  product?: ReactNode;
  /** Its context, in a line. */
  meta?: ReactNode;
  /** When, in words (“Just now”). */
  timestamp?: ReactNode;
  /** When, as a moment (ISO 8601), for the timestamp’s `<time>`. */
  dateTime?: string;
  /** The More menu's actions: a button opens them. */
  moreItems?: CardMoreItem[];
  /** The More button's accessible name. */
  moreLabel?: string;
  /** Makes it pressable: its title is a button that calls it. */
  onClick?: (event: MouseEvent<HTMLElement>) => void;
  /** Makes it pressable: its title is a link here. */
  href?: string;
}

export const EventRow = forwardRef<HTMLDivElement, EventRowProps>(
  function EventRow(inProps, ref) {
    // As the app's MUI theme sets them (components.SolarEventRow), under the caller's own.
    const {
      title,
      leading,
      product,
      meta,
      timestamp,
      dateTime,
      moreItems,
      moreLabel = 'More actions',
      onClick,
      href,
      className,
      sx,
      ...rest
    } = useSolarProps(inProps, 'SolarEventRow');
    const look = {};
    const composed = solarEventRowCompose(look);
    const pressable = onClick != null || href != null;
    const menu = moreItems != null && moreItems.length > 0;
    // A slot left empty is not drawn.
    const parts = {
      ...composed,
      leading: {
        ...composed.leading,
        present: composed.leading?.present !== false && leading != null,
      },
      productTag: {
        ...composed.productTag,
        present: composed.productTag?.present !== false && product != null,
      },
      metaText: {
        ...composed.metaText,
        present: composed.metaText?.present !== false && meta != null,
      },
      timestamp: {
        ...composed.timestamp,
        present: composed.timestamp?.present !== false && timestamp != null,
      },
      more: {
        ...composed.more,
        present: composed.more?.present !== false && menu,
      },
    };
    const [open, setOpen] = useState(false);
    const moreRef = useRef<HTMLButtonElement>(null);
    // Pressable, its title is its action, stretched over the card.
    const titled = pressable ? (
      <ButtonBase
        className="SolarEventRow-press"
        disableRipple
        {...(href != null ? { href } : {})}
        onClick={onClick}
      >
        {title}
      </ButtonBase>
    ) : (
      title
    );
    return (
      <>
        <Box
          ref={ref}
          className={
            [pressable ? 'SolarEventRow-pressable' : null, className]
              .filter(Boolean)
              .join(' ') || undefined
          }
          {...rest}
          sx={[solarEventRowStyle(look), ...(Array.isArray(sx) ? sx : [sx])]}
        >
          {drawChildren('root', {
            prefix: 'SolarEventRow',
            tree: solarEventRowTree,
            slots: solarEventRowSlots,
            parts,
            text: {
              title: titled,
              productTag: product,
              metaText: meta,
              timestamp:
                timestamp != null ? (
                  <time dateTime={dateTime}>{timestamp}</time>
                ) : null,
            },
            icons: {
              leading: <span>{leading}</span>,
              more: (
                <ButtonBase
                  ref={moreRef}
                  disableRipple
                  disabled={false}
                  aria-label={moreLabel}
                  aria-haspopup="menu"
                  aria-expanded={open}
                  onClick={() => setOpen(true)}
                >
                  <IconMore />
                </ButtonBase>
              ),
            },
          })}
        </Box>
        {menu ? (
          <DropdownMenu
            anchorEl={moreRef.current}
            open={open}
            onClose={() => setOpen(false)}
          >
            {moreItems.map((item, i) => (
              <DropdownItem
                key={i}
                disabled={item.disabled}
                icon={item.icon}
                onClick={() => {
                  setOpen(false);
                  item.onSelect();
                }}
              >
                {item.label}
              </DropdownItem>
            ))}
          </DropdownMenu>
        ) : null}
      </>
    );
  },
);
