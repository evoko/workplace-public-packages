/**
 * SOLAR Link.
 *
 * Written by hand, and never regenerated; its layer tree and slot names are the IR's,
 * `solarLinkTree` and `solarLinkSlots` beside the recipe. What it looks like is not here. That is
 * the recipe, `solarLinkStyle` in `@bwp-web/styles/mui`: each size's text style, underlined on
 * hover, its colours by state, and its icons' sizes.
 *
 * For navigation, inside the product or out of it; an action that changes something is a Button.
 * It wraps MUI's Link, an <a>, with its label and icons drawn from Figma's layer tree
 * (`internal/layers.tsx`). A leading icon says internal (a chevron), a trailing one outbound (an
 * external-link arrow); one of the two, not both. A disabled link is no link: it keeps its text,
 * loses its href, and says it is disabled. The app must load `@bwp-web/styles/tokens.css`.
 */

import { useSolarProps } from './internal/theme.js';
import MuiLink, { type LinkProps as MuiLinkProps } from '@mui/material/Link';
import { forwardRef, type ReactNode } from 'react';
import {
  solarLinkCompose,
  solarLinkStyle,
  type SolarLinkProps,
  solarLinkSlots,
  solarLinkTree,
} from '@bwp-web/styles/mui';
import { drawChildren } from './internal/layers.js';

export interface LinkProps
  extends
    SolarLinkProps,
    Omit<
      MuiLinkProps,
      | keyof SolarLinkProps
      | 'children'
      | 'color'
      | 'underline'
      | 'variant'
      | 'ref'
    > {
  /** The link's words, which say where it goes ("Read the release notes", not "click here"). */
  children: ReactNode;
  /** An icon before the words: internal navigation. */
  leadingIcon?: ReactNode;
  /** An icon after the words: outbound, or a new tab. */
  trailingIcon?: ReactNode;
}

export const Link = forwardRef<HTMLAnchorElement, LinkProps>(
  function Link(inProps, ref) {
    // As the app's MUI theme sets them (components.SolarLink), under the caller's own.
    const {
      size,
      disabled,
      children,
      leadingIcon,
      trailingIcon,
      href,
      className,
      sx,
      ...rest
    } = useSolarProps(inProps, 'SolarLink');
    const parts = solarLinkCompose({ size, disabled });
    // A slot left empty is not drawn.
    const drawn = {
      ...parts,
      leadingIcon: { ...parts.leadingIcon, present: leadingIcon != null },
      trailingIcon: { ...parts.trailingIcon, present: trailingIcon != null },
    };
    return (
      <MuiLink
        ref={ref}
        href={disabled ? undefined : href}
        aria-disabled={disabled || undefined}
        className={
          [disabled ? 'SolarLink-disabled' : null, className]
            .filter(Boolean)
            .join(' ') || undefined
        }
        {...rest}
        underline="none"
        sx={[
          solarLinkStyle({ size, disabled }),
          ...(Array.isArray(sx) ? sx : [sx]),
        ]}
      >
        {drawChildren('root', {
          prefix: 'SolarLink',
          tree: solarLinkTree,
          slots: solarLinkSlots,
          parts: drawn,
          text: { label: children },
          icons: {
            leadingIcon: <span>{leadingIcon}</span>,
            trailingIcon: <span>{trailingIcon}</span>,
          },
        })}
      </MuiLink>
    );
  },
);
