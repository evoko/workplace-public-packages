/**
 * SOLAR PaginationItem.
 *
 * Written by hand, and never regenerated; its layer tree and slot names are the IR's,
 * `solarPaginationItemTree` and `solarPaginationItemSlots` beside the recipe. What it looks like is
 * not here. That is the recipe, `solarPaginationItemStyle` and `solarPaginationItemCompose` in
 * `@bwp-web/styles/mui`: the page's fill and ring by state, and its number's ink.
 *
 * One page of a Pagination: MUI's ButtonBase, a button (a link where it has an `href`) that goes to
 * its page, its number its children, named "Page 3" for a screen reader (`aria-label`
 * overrides). The `selected` one is the current page (`aria-current="page"`). Its own 24 × 24 box
 * is its target: the pages sit 4px apart. Use it inside a Pagination. The app must load
 * `@bwp-web/styles/tokens.css`.
 */

import { useSolarProps } from './internal/theme.js';
import ButtonBase, { type ButtonBaseProps } from '@mui/material/ButtonBase';
import { forwardRef, type ReactNode } from 'react';
import {
  solarPaginationItemCompose,
  solarPaginationItemStyle,
  type SolarPaginationItemProps,
  solarPaginationItemSlots,
  solarPaginationItemTree,
} from '@bwp-web/styles/mui';
import { drawChildren } from './internal/layers.js';

export interface PaginationItemProps
  extends
    SolarPaginationItemProps,
    Omit<ButtonBaseProps, keyof SolarPaginationItemProps | 'children' | 'ref'> {
  /** The page's number. */
  children: ReactNode;
  /** Where it goes: it is a link. */
  href?: string;
}

export const PaginationItem = forwardRef<
  HTMLButtonElement,
  PaginationItemProps
>(function PaginationItem(inProps, ref) {
  // As the app's MUI theme sets them (components.SolarPaginationItem), under the caller's own.
  const {
    selected = false,
    disabled = false,
    children,
    sx,
    ...rest
  } = useSolarProps(inProps, 'SolarPaginationItem');
  const look = { selected, disabled };
  const parts = solarPaginationItemCompose(look);
  return (
    <ButtonBase
      ref={ref}
      aria-current={selected ? 'page' : undefined}
      aria-label={
        typeof children === 'number' || typeof children === 'string'
          ? `Page ${children}`
          : undefined
      }
      {...rest}
      disabled={disabled}
      disableRipple
      sx={[solarPaginationItemStyle(look), ...(Array.isArray(sx) ? sx : [sx])]}
    >
      {drawChildren('root', {
        prefix: 'SolarPaginationItem',
        tree: solarPaginationItemTree,
        slots: solarPaginationItemSlots,
        parts,
        text: { page: children },
      })}
    </ButtonBase>
  );
});
