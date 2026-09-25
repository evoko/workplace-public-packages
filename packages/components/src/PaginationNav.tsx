/**
 * SOLAR PaginationNav.
 *
 * Written by hand, and never regenerated; its layer tree and slot names are the IR's,
 * `solarPaginationNavTree` and `solarPaginationNavSlots` beside the recipe. What it looks like is
 * not here. That is the recipe, `solarPaginationNavStyle` and `solarPaginationNavCompose` in
 * `@bwp-web/styles/mui`: the arrow's fill and ring by state, and its chevron's ink.
 *
 * The previous or next arrow of a Pagination: MUI's ButtonBase, named "Previous page" or "Next page"
 * (`aria-label` overrides), disabled at the first and the last page rather than hidden, as its
 * description says, and still announced (`aria-disabled`). Its chevron points the way it goes,
 * mirrored in a right-to-left layout. Its own 24 × 24 box is its target. The app must load
 * `@bwp-web/styles/tokens.css`.
 */

import { useSolarProps } from './internal/theme.js';
import ButtonBase, { type ButtonBaseProps } from '@mui/material/ButtonBase';
import { IconChevronLeft, IconChevronRight } from '@bwp-web/assets';
import { forwardRef } from 'react';
import {
  solarPaginationNavCompose,
  solarPaginationNavStyle,
  type SolarPaginationNavProps,
  solarPaginationNavSlots,
  solarPaginationNavTree,
} from '@bwp-web/styles/mui';
import { drawChildren } from './internal/layers.js';

export interface PaginationNavProps
  extends
    SolarPaginationNavProps,
    Omit<ButtonBaseProps, keyof SolarPaginationNavProps | 'children' | 'ref'> {
  /** Where it goes: it is a link. */
  href?: string;
}

export const PaginationNav = forwardRef<HTMLButtonElement, PaginationNavProps>(
  function PaginationNav(inProps, ref) {
    // As the app's MUI theme sets them (components.SolarPaginationNav), under the caller's own.
    const {
      direction = 'previous',
      disabled = false,
      sx,
      ...rest
    } = useSolarProps(inProps, 'SolarPaginationNav');
    const look = { direction, disabled };
    const parts = solarPaginationNavCompose(look);
    return (
      <ButtonBase
        ref={ref}
        aria-label={direction === 'next' ? 'Next page' : 'Previous page'}
        {...rest}
        disabled={disabled}
        aria-disabled={disabled || undefined}
        disableRipple
        sx={[solarPaginationNavStyle(look), ...(Array.isArray(sx) ? sx : [sx])]}
      >
        {drawChildren('root', {
          prefix: 'SolarPaginationNav',
          tree: solarPaginationNavTree,
          slots: solarPaginationNavSlots,
          parts,
          icons: {
            icon: (
              {
                next: <IconChevronRight />,
                previous: <IconChevronLeft />,
              } as const
            )[direction ?? 'previous'],
          },
        })}
      </ButtonBase>
    );
  },
);
