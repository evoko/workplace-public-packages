/**
 * SOLAR Column Item.
 *
 * Written by hand, and never regenerated; its layer tree and slot names are the IR's,
 * `solarColumnItemTree` and `solarColumnItemSlots` beside the recipe. What it looks like is not
 * here. That is the recipe, `solarColumnItemStyle` and `solarColumnItemCompose` in
 * `@bwp-web/styles/mui`: the cell's padding and gap, the header's separator, and its words' text
 * styles.
 *
 * One cell of a Table's Row, drawn from Figma's layer tree (`internal/layers.tsx`): a column
 * header (`header`) or a data cell. What it holds decides its type (owner decision 2026-09-25), as
 * a Tag's content does: words (`children`), an `avatar` beside them (a user), or one of the
 * caller's SOLAR components: a `tag`, an `icon`, a `textInput`, a `dropdown`, a `button` or a
 * `toggle`. In a Row it is a cell or a column header (`role`); a `numeric` column's words sit at
 * the end, as the description says. A header sorts where it is given `onSort`: its words are then
 * a button, and `sort` says which way the column is sorted (`aria-sort`); no arrow is drawn, as
 * Figma draws none. The sorting itself is the caller's. The app must load
 * `@bwp-web/styles/tokens.css`.
 */

import { useSolarProps } from './internal/theme.js';
import Box, { type BoxProps } from '@mui/material/Box';
import { forwardRef, type ReactNode } from 'react';
import {
  solarColumnItemCompose,
  solarColumnItemStyle,
  type SolarColumnItemProps,
  solarColumnItemSlots,
  solarColumnItemTree,
} from '@bwp-web/styles/mui';
import { drawChildren } from './internal/layers.js';
import { useSolarRow } from './internal/table.js';

export interface ColumnItemProps
  extends
    SolarColumnItemProps,
    // MUI types BoxProps' ref for any element; the component's own comes from forwardRef.
    Omit<BoxProps, keyof SolarColumnItemProps | 'children' | 'ref'> {
  /** The cell's words: a column's name in a header, a value in a data cell, a user's name. */
  children?: ReactNode;
  /** A SOLAR Avatar (sm) before the words: a user cell. */
  avatar?: ReactNode;
  /** A SOLAR Tag: a status cell. */
  tag?: ReactNode;
  /** An icon: an icon cell. */
  icon?: ReactNode;
  /** A SOLAR Text Input (sm): an input cell. */
  textInput?: ReactNode;
  /** A SOLAR Dropdown (sm): a select cell. */
  dropdown?: ReactNode;
  /** A SOLAR Button (sm): a button cell. */
  button?: ReactNode;
  /** A SOLAR Toggle: a toggle cell. */
  toggle?: ReactNode;
  /** A column of figures: its words sit at the end. */
  numeric?: boolean;
  /** A header's column, sorted which way; unsorted where not given. */
  sort?: 'ascending' | 'descending';
  /** Called when a header is asked to sort its column: its words are then a button. */
  onSort?: () => void;
}

export const ColumnItem = forwardRef<HTMLDivElement, ColumnItemProps>(
  function ColumnItem(inProps, ref) {
    // As the app's MUI theme sets them (components.SolarColumnItem), under the caller's own.
    const {
      header = false,
      children,
      avatar,
      tag,
      icon,
      textInput,
      dropdown,
      button,
      toggle,
      numeric = false,
      sort,
      onSort,
      className,
      sx,
      ...rest
    } = useSolarProps(inProps, 'SolarColumnItem');
    const row = useSolarRow();
    // Its type from what it holds; a header holds words.
    const type = header
      ? ('text' as const)
      : avatar != null
        ? ('user' as const)
        : tag != null
          ? ('status' as const)
          : icon != null
            ? ('icon' as const)
            : textInput != null
              ? ('input' as const)
              : dropdown != null
                ? ('select' as const)
                : button != null
                  ? ('button' as const)
                  : toggle != null
                    ? ('toggle' as const)
                    : ('text' as const);
    const look = { header, type };
    const parts = solarColumnItemCompose(look);
    const held = (node: ReactNode) =>
      function Held({
        className: cls,
        style,
      }: {
        className: string;
        style?: object;
      }) {
        return (
          <span className={cls} style={style}>
            {node}
          </span>
        );
      };
    // A header that sorts: its words are the button.
    const words =
      header && onSort ? (
        <button type="button" className="SolarColumnItem-sort" onClick={onSort}>
          {children}
        </button>
      ) : (
        children
      );
    return (
      <Box
        ref={ref}
        role={row ? (header ? 'columnheader' : 'cell') : undefined}
        aria-sort={row && header && onSort ? (sort ?? 'none') : undefined}
        {...rest}
        className={
          [numeric ? 'SolarColumnItem-numeric' : null, className]
            .filter(Boolean)
            .join(' ') || undefined
        }
        sx={[solarColumnItemStyle(look), ...(Array.isArray(sx) ? sx : [sx])]}
      >
        {drawChildren('root', {
          prefix: 'SolarColumnItem',
          tree: solarColumnItemTree,
          slots: solarColumnItemSlots,
          parts,
          text: { label: words, name: children },
          render: {
            avatar: held(avatar),
            tag: held(tag),
            textInput: held(textInput),
            dropdown: held(dropdown),
            button: held(button),
            toggle: held(toggle),
          },
          icons: { icon: <span>{icon}</span> },
        })}
      </Box>
    );
  },
);
