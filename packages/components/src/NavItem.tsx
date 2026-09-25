/**
 * SOLAR Nav Item.
 *
 * Written by hand, and never regenerated; its layer tree and slot names are the IR's,
 * `solarNavItemTree` and `solarNavItemSlots` beside the recipe. What it looks like is not here.
 * That is the recipe, `solarNavItemStyle` and `solarNavItemCompose` in `@bwp-web/styles/mui`: the
 * item's fill by state, and its icon's and label's ink, collapsed and expanded.
 *
 * One destination of a sidebar or a top bar: MUI's ButtonBase, a link where it has an `href` (or a
 * router's link as its `component`), a button otherwise. The `selected` one is the current page
 * (`aria-current="page"`), its icon solid (`iconSolid`, where given) as Figma swaps it. Expanded,
 * it shows its `label` beside its icon and spans its sidebar; collapsed, it is its icon alone, a
 * 40px square, named by its label for a screen reader (give `aria-label` where the label is not
 * text). A focused item draws SOLAR's focus ring. The app must load `@bwp-web/styles/tokens.css`.
 */

import { useSolarProps } from './internal/theme.js';
import ButtonBase, { type ButtonBaseProps } from '@mui/material/ButtonBase';
import { forwardRef, type ReactNode } from 'react';
import {
  solarNavItemCompose,
  solarNavItemStyle,
  type SolarNavItemProps,
  solarNavItemSlots,
  solarNavItemTree,
} from '@bwp-web/styles/mui';
import { drawChildren } from './internal/layers.js';

export interface NavItemProps
  extends
    SolarNavItemProps,
    Omit<ButtonBaseProps, keyof SolarNavItemProps | 'children' | 'ref'> {
  /** Where it goes, and its name: drawn expanded, read collapsed. */
  label: ReactNode;
  /** Its icon, outlined, as it is drawn at rest. */
  iconOutline: ReactNode;
  /** Its icon while selected, solid; the outlined one where none is given. */
  iconSolid?: ReactNode;
  /** Where it goes: it is a link. */
  href?: string;
}

export const NavItem = forwardRef<HTMLButtonElement, NavItemProps>(
  function NavItem(inProps, ref) {
    // As the app's MUI theme sets them (components.SolarNavItem), under the caller's own.
    const {
      selected = false,
      expanded = false,
      label,
      iconOutline,
      iconSolid,
      className,
      sx,
      ...rest
    } = useSolarProps(inProps, 'SolarNavItem');
    const look = { selected, expanded };
    const parts = solarNavItemCompose(look);
    return (
      <ButtonBase
        ref={ref}
        aria-current={selected ? 'page' : undefined}
        // Collapsed, its words are not drawn: they name it.
        aria-label={!expanded && typeof label === 'string' ? label : undefined}
        {...rest}
        disableRipple
        className={className}
        sx={[solarNavItemStyle(look), ...(Array.isArray(sx) ? sx : [sx])]}
      >
        {drawChildren('root', {
          prefix: 'SolarNavItem',
          tree: solarNavItemTree,
          slots: solarNavItemSlots,
          parts,
          text: { label },
          icons: {
            iconOutline: (
              <span>{selected ? (iconSolid ?? iconOutline) : iconOutline}</span>
            ),
          },
        })}
      </ButtonBase>
    );
  },
);
