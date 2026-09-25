/**
 * SOLAR ListItem.
 *
 * Written by hand, and never regenerated; its layer tree and slot names are the IR's,
 * `solarListItemTree` and `solarListItemSlots` beside the recipe. What it looks like is not here.
 * That is the recipe, `solarListItemStyle` and `solarListItemCompose` in `@bwp-web/styles/mui`: the
 * row's fill and focus ring by state, its padding, compact or not, and its words' and icons' ink.
 *
 * One row of a List, which a user chooses: MUI's ListItemButton, a button (`component="a"` and an
 * `href` for navigation), its words, a second line (`helper`), an `icon` or an `avatar` (a
 * SOLAR Avatar, which makes it an avatar row) before them and a `trailing` icon (a chevron) after,
 * drawn from Figma's layer tree (`internal/layers.tsx`). One trailing element, never two, SOLAR
 * says. A selected row is announced as the current one, or as selected where the list is a listbox
 * (`role="option"`). In a List it takes the list's compactness. The app must load
 * `@bwp-web/styles/tokens.css`.
 */

import { useSolarProps } from './internal/theme.js';
import ListItemButton, {
  type ListItemButtonProps,
} from '@mui/material/ListItemButton';
import { forwardRef, type ReactNode } from 'react';
import {
  solarListItemCompose,
  solarListItemStyle,
  type SolarListItemProps,
  solarListItemSlots,
  solarListItemTree,
} from '@bwp-web/styles/mui';
import { drawChildren } from './internal/layers.js';
import { useListCompact } from './List.js';

export interface ListItemProps
  extends
    SolarListItemProps,
    Omit<
      ListItemButtonProps,
      | keyof SolarListItemProps
      | 'children'
      | 'dense'
      | 'divider'
      | 'disableGutters'
      | 'alignItems'
      | 'ref'
    > {
  /** The row's words. */
  children: ReactNode;
  /** A second line under the words, quieter. */
  helper?: ReactNode;
  /** An icon before the words. */
  icon?: ReactNode;
  /** A SOLAR Avatar before the words, in place of an icon: an avatar row. */
  avatar?: ReactNode;
  /** An icon after the words: a chevron, where the row opens something. */
  trailing?: ReactNode;
  /** Where the row goes, with `component="a"`. */
  href?: string;
}

export const ListItem = forwardRef<HTMLDivElement, ListItemProps>(
  function ListItem(inProps, ref) {
    // As the app's MUI theme sets them (components.SolarListItem), under the caller's own.
    const {
      selected = false,
      disabled = false,
      compact: compactProp,
      children,
      helper,
      icon,
      avatar,
      trailing,
      role,
      className,
      sx,
      ...rest
    } = useSolarProps(inProps, 'SolarListItem');
    // In a List, the list's compactness, as Figma draws its rows; its type from what it is given.
    const compact = useListCompact() ?? compactProp;
    const look = {
      selected,
      disabled,
      compact,
      type: avatar != null ? ('avatar' as const) : ('icon' as const),
    };
    const composed = solarListItemCompose(look);
    // A slot left empty is not drawn.
    const parts = {
      ...composed,
      icon: { ...composed.icon, present: avatar == null && icon != null },
      avatar: { ...composed.avatar, present: avatar != null },
      helper: { ...composed.helper, present: helper != null },
      trailing: { ...composed.trailing, present: trailing != null },
    };
    return (
      <ListItemButton
        ref={ref}
        // ButtonBase's own role, a button, where the caller gives none.
        {...(role ? { role } : {})}
        aria-selected={role === 'option' ? selected : undefined}
        aria-current={role !== 'option' && selected ? true : undefined}
        {...rest}
        disabled={disabled}
        disableRipple
        className={
          [selected ? 'SolarListItem-selected' : null, className]
            .filter(Boolean)
            .join(' ') || undefined
        }
        sx={[solarListItemStyle(look), ...(Array.isArray(sx) ? sx : [sx])]}
      >
        {drawChildren('root', {
          prefix: 'SolarListItem',
          tree: solarListItemTree,
          slots: solarListItemSlots,
          parts,
          text: { label: children, helper },
          render: {
            avatar: ({ className: cls, style }) => (
              <span className={cls} style={style}>
                {avatar}
              </span>
            ),
          },
          icons: {
            icon: <span>{icon}</span>,
            trailing: <span>{trailing}</span>,
          },
        })}
      </ListItemButton>
    );
  },
);
