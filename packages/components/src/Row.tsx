/**
 * SOLAR Row.
 *
 * Written by hand, and never regenerated; its layer tree and slot names are the IR's,
 * `solarRowTree` and `solarRowSlots` beside the recipe. What it looks like is not here. That is the
 * recipe, `solarRowStyle` and `solarRowCompose` in `@bwp-web/styles/mui`: the row's height and
 * corners, its selected fill and its hover.
 *
 * One row of a Table, drawn from Figma's layer tree (`internal/layers.tsx`) inside MUI's TableRow:
 * the header row (`type="title"`), a flat row (`"non-expandable"`), or the top, a middle or the
 * bottom row of a group that expands. Its cells are the caller's Column Items (`children`); its
 * select cell (a RowSelect) and expand cell (a RowExpand) are its own, drawn where it is
 * `selectable` and `expandable`, as its Table says or, alone, as given. A top row's expand cell
 * is a button that shows or hides its group (`expanded`, `onExpandedChange`); which rows the group
 * shows is the caller's. A selected row (`selected`, `onSelectedChange`) is filled; the header
 * row's select cell selects every row, `mixed` where some are. A row given `onClick` draws its
 * hover (owner decision 2026-09-25); a keyboard user reaches what it does through its cells. In a
 * Table it is a row to a screen reader, its cells cells. The app must load
 * `@bwp-web/styles/tokens.css`.
 */

import { useSolarProps } from './internal/theme.js';
import TableRow, { type TableRowProps } from '@mui/material/TableRow';
import { forwardRef, useMemo, type MouseEvent, type ReactNode } from 'react';
import {
  solarRowCompose,
  solarRowStyle,
  type SolarRowProps,
  solarRowSlots,
  solarRowTree,
} from '@bwp-web/styles/mui';
import { drawChildren } from './internal/layers.js';
import { SolarRowContext, useSolarTable } from './internal/table.js';
import { RowExpand } from './RowExpand.js';
import { RowSelect } from './RowSelect.js';

export interface RowProps
  extends
    SolarRowProps,
    // MUI types TableRowProps' ref for any element; the component's own comes from forwardRef.
    Omit<
      TableRowProps<'div'>,
      keyof SolarRowProps | 'children' | 'hover' | 'ref'
    > {
  /** The row's cells: Column Items, one a column. */
  children?: ReactNode;
  /** Whether it draws its select cell; in a Table, the table says. */
  selectable?: boolean;
  /** Whether it draws its expand cell; in a Table, the table says. */
  expandable?: boolean;
  /** The header row's select cell, where some rows are selected and some not. */
  mixed?: boolean;
  /** Called with the value its select cell asks for. */
  onSelectedChange?: (selected: boolean) => void;
  /** What its select cell selects, for a screen reader. */
  selectLabel?: string;
  /** A top row's group, shown. */
  expanded?: boolean;
  /** Called with the value a top row's expand button asks for. */
  onExpandedChange?: (expanded: boolean) => void;
  /** What its expand button shows or hides, for a screen reader. */
  expandLabel?: string;
}

/** The expand cell each type draws: its RowExpand, the chevron's cell or a connector. */
const EXPAND = {
  title: 'title-row',
  'non-expandable': 'collapsed',
  top: 'collapsed',
  middle: 'middle-row',
  bottom: 'bottom-row',
} as const;

export const Row = forwardRef<HTMLDivElement, RowProps>(
  function Row(inProps, ref) {
    // As the app's MUI theme sets them (components.SolarRow), under the caller's own.
    const {
      type = 'non-expandable',
      selected = false,
      selectable: selectableProp,
      expandable: expandableProp,
      mixed = false,
      onSelectedChange,
      selectLabel,
      expanded = false,
      onExpandedChange,
      expandLabel,
      children,
      onClick,
      className,
      sx,
      ...rest
    } = useSolarProps(inProps, 'SolarRow');
    const table = useSolarTable();
    const selectable = table?.selectable ?? selectableProp ?? false;
    const expandable = table?.expandable ?? expandableProp ?? false;
    const header = type === 'title';
    const look = { type, selected };
    const composed = solarRowCompose(look);
    // A cell left out is not drawn.
    const parts = {
      ...composed,
      checkBox: { ...composed.checkBox, present: selectable },
      expand: { ...composed.expand, present: expandable },
    };
    const scope = useMemo(() => ({ header }), [header]);
    return (
      <TableRow
        component="div"
        ref={ref}
        // A row only in a table, where the role is valid.
        role={table ? 'row' : undefined}
        {...rest}
        onClick={onClick}
        className={
          [
            selected ? 'SolarRow-selected' : null,
            onClick ? 'SolarRow-pressable' : null,
            className,
          ]
            .filter(Boolean)
            .join(' ') || undefined
        }
        sx={[solarRowStyle(look), ...(Array.isArray(sx) ? sx : [sx])]}
      >
        <SolarRowContext.Provider value={table ? scope : null}>
          {drawChildren('root', {
            prefix: 'SolarRow',
            tree: solarRowTree,
            slots: solarRowSlots,
            parts,
            content: { titleRowContent: children },
            render: {
              checkBox: ({ className: cls, style }) => (
                <span className={cls} style={style}>
                  <RowSelect
                    header={header}
                    checked={selected}
                    mixed={mixed}
                    label={selectLabel}
                    onChange={(_, on) => onSelectedChange?.(on)}
                    onClick={(e) => e.stopPropagation()}
                  />
                </span>
              ),
              expand: ({ className: cls, style }) => (
                <span
                  className={cls}
                  style={style}
                  role={table ? (header ? 'columnheader' : 'cell') : undefined}
                >
                  {type === 'top' ? (
                    // The expand cell is the button: a user shows or hides the group with it.
                    <RowExpand
                      component="button"
                      type={expanded ? 'expanded' : 'collapsed'}
                      className="SolarRow-expandButton"
                      aria-hidden={false}
                      aria-expanded={expanded}
                      aria-label={
                        expandLabel ?? (expanded ? 'Hide rows' : 'Show rows')
                      }
                      onClick={(e: MouseEvent) => {
                        e.stopPropagation();
                        onExpandedChange?.(!expanded);
                      }}
                    />
                  ) : (
                    <RowExpand
                      type={EXPAND[type]}
                      chevron={type !== 'non-expandable'}
                    />
                  )}
                </span>
              ),
            },
          })}
        </SolarRowContext.Provider>
      </TableRow>
    );
  },
);
