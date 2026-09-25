/**
 * SOLAR Table.
 *
 * Written by hand, and never regenerated; its layer tree and slot names are the IR's,
 * `solarTableTree` and `solarTableSlots` beside the recipe. What it looks like is not here. That is
 * the recipe, `solarTableStyle` and `solarTableCompose` in `@bwp-web/styles/mui`: the edge along
 * its foot and its mobile fade.
 *
 * A data table's chassis, drawn from Figma's layer tree (`internal/layers.tsx`) inside MUI's
 * Table: its `header`, a SOLAR Row of type title holding the header cells, and its rows (the
 * caller's Rows, `children`). It tells its rows whether they draw their select and expand cells
 * (`selectable`, `expandable`), so the caller sets them once; a Row in it is a row to a screen
 * reader. The `breakpoint` is the app's to give (owner decision 2026-09-25): on mobile the table
 * draws Figma's fade at its right edge. Sorting, selection and which rows a group shows are the
 * caller's. Compose it with a TableHeader above and a TableFooter below. The app must load
 * `@bwp-web/styles/tokens.css`.
 */

import { useSolarProps } from './internal/theme.js';
import MuiTable, {
  type TableProps as MuiTableProps,
} from '@mui/material/Table';
import { forwardRef, useMemo, type ReactNode } from 'react';
import {
  solarTableCompose,
  solarTableStyle,
  type SolarTableProps,
  solarTableSlots,
  solarTableTree,
} from '@bwp-web/styles/mui';
import { drawChildren } from './internal/layers.js';
import { SolarTableContext } from './internal/table.js';

export interface TableProps
  extends
    SolarTableProps,
    // MUI types TableProps' ref for any element; the component's own comes from forwardRef.
    Omit<
      MuiTableProps<'div'>,
      keyof SolarTableProps | 'children' | 'size' | 'padding' | 'ref'
    > {
  /** The header row: a SOLAR Row of type title, its cells the table's column headers. */
  header?: ReactNode;
  /** The rows: SOLAR Rows, one for each item of the caller's data. */
  children?: ReactNode;
}

export const Table = forwardRef<HTMLDivElement, TableProps>(
  function Table(inProps, ref) {
    // As the app's MUI theme sets them (components.SolarTable), under the caller's own.
    const {
      breakpoint = 'desktop',
      expandable = false,
      selectable = false,
      header,
      children,
      sx,
      ...rest
    } = useSolarProps(inProps, 'SolarTable');
    const look = { breakpoint, expandable, selectable };
    const parts = solarTableCompose(look);
    const scope = useMemo(
      () => ({ breakpoint, expandable, selectable }),
      [breakpoint, expandable, selectable],
    );
    return (
      <MuiTable
        component="div"
        ref={ref}
        {...rest}
        sx={[solarTableStyle(look), ...(Array.isArray(sx) ? sx : [sx])]}
      >
        <SolarTableContext.Provider value={scope}>
          {drawChildren('root', {
            prefix: 'SolarTable',
            tree: solarTableTree,
            slots: solarTableSlots,
            parts,
            content: { rows: children },
            render: {
              header: ({ className: cls, style }) => (
                <div className={cls} style={style}>
                  {header}
                </div>
              ),
            },
          })}
        </SolarTableContext.Provider>
      </MuiTable>
    );
  },
);
