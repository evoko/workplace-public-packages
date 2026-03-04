import {
  Box,
  Checkbox,
  Table as MuiTable,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  type SxProps,
  type Theme,
} from '@mui/material';
import { flexRender, type Table } from '@tanstack/react-table';
import type { ReactNode } from 'react';
import { BiampTableEmptyState } from './BiampTableEmptyState';
import { BiampTableErrorState } from './BiampTableErrorState';
import './tanstack-meta';
import { useLoadingDelay } from './useLoadingDelay';

export type BiampTableProps<TData> = {
  /** TanStack Table instance to connect to. */
  table: Table<TData>;
  /** Called when a clickable body row is clicked. Receives the row's original data. */
  onRowClick?: (row: TData) => void;
  /**
   * Controls which rows are clickable. When omitted, all rows are clickable if
   * `onRowClick` is provided. Has no effect when `onRowClick` is not provided.
   */
  isRowClickable?: (row: TData) => boolean;
  /** When true, shows a LinearProgress bar below the table header. */
  loading?: boolean;
  /** When truthy, shown in place of table body rows. Pass `true` for the default error state, or a custom ReactNode. */
  error?: boolean | ReactNode;
  /** When truthy and the table has no rows, shown instead of an empty body. Pass `true` for the default empty state, or a custom ReactNode. */
  empty?: boolean | ReactNode;
  /** When true, hides the "select all" header checkbox while keeping individual row checkboxes. */
  hideSelectAll?: boolean;
  /** sx applied to the root TableContainer (rendered as a Box). */
  sx?: SxProps<Theme>;
};

export function BiampTable<TData>({
  table,
  onRowClick,
  isRowClickable,
  loading,
  error,
  empty,
  hideSelectAll,
  sx,
}: BiampTableProps<TData>) {
  // Only show the checkbox column when the caller explicitly opted in.
  // TanStack applies enableRowSelection=true as a runtime default for per-row
  // checks, but we require an explicit boolean true or function here so that
  // tables without selection don't accidentally render a checkbox column.
  const enableRowSelection =
    table.options.enableRowSelection === true ||
    typeof table.options.enableRowSelection === 'function';

  // Sum visible column min-widths so the <table> element itself gets a concrete
  // minWidth. Without this, `width: 100%` on the table always fills the container
  // and columns just share available space instead of overflowing horizontally.
  const tableMinWidth = table.getVisibleLeafColumns().reduce(
    (sum, col) => {
      const mw = col.columnDef.meta?.minWidth;
      return sum + (typeof mw === 'number' ? mw : 40);
    },
    enableRowSelection ? 48 : 0,
  );

  const totalColumns =
    table.getVisibleLeafColumns().length + (enableRowSelection ? 1 : 0);

  const showLoading = useLoadingDelay(!!loading);

  const rows = table.getRowModel().rows;
  const showError = !!error;
  const showEmpty = !showError && rows.length === 0;

  return (
    <TableContainer
      component={Box}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        overflow: 'auto',
        overscrollBehavior: 'none',
        ...sx,
      }}
    >
      <MuiTable
        sx={{
          minWidth: tableMinWidth,
          height: showError || showEmpty ? '100%' : undefined,
        }}
      >
        <TableHead>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {enableRowSelection && (
                <TableCell
                  padding="checkbox"
                  sx={{
                    position: 'sticky',
                    left: 0,
                    zIndex: 3,
                    bgcolor: 'background.paper',
                  }}
                >
                  {!hideSelectAll && (
                    <Checkbox
                      checked={table.getIsAllPageRowsSelected()}
                      indeterminate={table.getIsSomePageRowsSelected()}
                      onChange={table.getToggleAllPageRowsSelectedHandler()}
                    />
                  )}
                </TableCell>
              )}
              {headerGroup.headers.map((header) => {
                const sticky = header.column.columnDef.meta?.sticky;
                return (
                  <TableCell
                    key={header.id}
                    sortDirection={header.column.getIsSorted() || false}
                    sx={{
                      minWidth: header.column.columnDef.meta?.minWidth ?? 40,
                      ...(sticky && {
                        position: 'sticky',
                        [sticky]: 0,
                        zIndex: 3,
                        bgcolor: 'background.paper',
                      }),
                    }}
                  >
                    {header.isPlaceholder ? null : header.column.getCanSort() ? (
                      <TableSortLabel
                        active={!!header.column.getIsSorted()}
                        direction={header.column.getIsSorted() || 'asc'}
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                      </TableSortLabel>
                    ) : (
                      flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )
                    )}
                  </TableCell>
                );
              })}
            </TableRow>
          ))}
        </TableHead>

        <TableBody sx={{ opacity: showLoading ? 0.3 : 1 }}>
          {showError ? (
            <TableRow>
              <TableCell
                colSpan={totalColumns}
                sx={{
                  textAlign: 'center',
                  verticalAlign: 'middle',
                  height: '100%',
                }}
              >
                {error === true ? <BiampTableErrorState /> : error}
              </TableCell>
            </TableRow>
          ) : showEmpty ? (
            <TableRow>
              <TableCell
                colSpan={totalColumns}
                sx={{
                  textAlign: 'center',
                  verticalAlign: 'middle',
                  height: '100%',
                }}
              >
                {!empty || empty === true ? <BiampTableEmptyState /> : empty}
              </TableCell>
            </TableRow>
          ) : (
            rows.map((row) => {
              const clickable = onRowClick
                ? isRowClickable
                  ? isRowClickable(row.original)
                  : true
                : false;

              return (
                <TableRow
                  key={row.id}
                  hover={clickable}
                  selected={
                    enableRowSelection ? row.getIsSelected() : undefined
                  }
                  sx={{ cursor: clickable ? 'pointer' : undefined }}
                  onClick={
                    clickable ? () => onRowClick!(row.original) : undefined
                  }
                >
                  {enableRowSelection && (
                    <TableCell
                      padding="checkbox"
                      sx={{
                        position: 'sticky',
                        left: 0,
                        zIndex: 2,
                        bgcolor: 'background.paper',
                        '.MuiTableRow-hover:hover > &, .Mui-selected > &': {
                          bgcolor: ({ palette }) =>
                            palette.mode === 'dark'
                              ? palette.grey[800]
                              : palette.grey[100],
                        },
                      }}
                    >
                      <Checkbox
                        checked={row.getIsSelected()}
                        disabled={!row.getCanSelect()}
                        onChange={row.getToggleSelectedHandler()}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </TableCell>
                  )}
                  {row.getVisibleCells().map((cell) => {
                    const sticky = cell.column.columnDef.meta?.sticky;
                    return (
                      <TableCell
                        key={cell.id}
                        sx={{
                          minWidth: cell.column.columnDef.meta?.minWidth ?? 40,
                          ...(sticky && {
                            position: 'sticky',
                            [sticky]: 0,
                            zIndex: 2,
                            bgcolor: 'background.paper',
                            '.MuiTableRow-hover:hover > &, .Mui-selected > &': {
                              bgcolor: ({ palette }: Theme) =>
                                palette.mode === 'dark'
                                  ? palette.grey[800]
                                  : palette.grey[100],
                            },
                          }),
                        }}
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </TableCell>
                    );
                  })}
                </TableRow>
              );
            })
          )}
        </TableBody>
      </MuiTable>
    </TableContainer>
  );
}
