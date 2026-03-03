import React, { useState } from 'react';
import {
  Box,
  Button,
  Checkbox,
  ListItemText,
  Menu,
  MenuItem,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableContainerProps,
  TableHead,
  TablePagination,
  TableRow,
  TableSortLabel,
  type SxProps,
  type Theme,
} from '@mui/material';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
  type RowSelectionState,
  type VisibilityState,
  type OnChangeFn,
} from '@tanstack/react-table';

export type BiampTableProps<TData> = {
  /** The data array to display. Each element becomes a row. */
  data: TData[];
  /** TanStack Table column definitions. */
  columns: ColumnDef<TData, unknown>[];

  /** Enable column header click-to-sort. */
  enableSorting?: boolean;
  /** Controlled sorting state. Omit for internal state. */
  sorting?: SortingState;
  /** Callback when sorting changes. */
  onSortingChange?: OnChangeFn<SortingState>;

  /** Enable pagination footer. */
  enablePagination?: boolean;
  /** Rows-per-page options. Default: [5, 10, 25]. */
  rowsPerPageOptions?: number[];

  /** Enable checkbox selection column. */
  enableRowSelection?: boolean;
  /** Controlled selection state. Omit for internal state. */
  rowSelection?: RowSelectionState;
  /** Callback when selection changes. */
  onRowSelectionChange?: OnChangeFn<RowSelectionState>;

  /** Enable a column-visibility toggle menu. */
  enableColumnVisibility?: boolean;
  /** Controlled visibility state. Omit for internal state. */
  columnVisibility?: VisibilityState;
  /** Callback when visibility changes. */
  onColumnVisibilityChange?: OnChangeFn<VisibilityState>;

  /** Called when a body row is clicked. Receives the row's original data. */
  onRowClick?: (row: TData) => void;

  /** Props forwarded to the MUI TableContainer. */
  TableContainerProps?: Omit<TableContainerProps, 'children'>;
  /** sx applied to the TableContainer. */
  sx?: SxProps<Theme>;
  /** Paper variant for the wrapping container. Default: "outlined". */
  paperVariant?: 'outlined' | 'elevation';
  /** Unique row identifier accessor. Defaults to row index. */
  getRowId?: (originalRow: TData, index: number) => string;
};

export function BiampTable<TData>({
  data,
  columns,
  enableSorting = false,
  sorting: sortingProp,
  onSortingChange,
  enablePagination = false,
  rowsPerPageOptions,
  enableRowSelection = false,
  rowSelection: rowSelectionProp,
  onRowSelectionChange,
  enableColumnVisibility = false,
  columnVisibility: columnVisibilityProp,
  onColumnVisibilityChange,
  onRowClick,
  TableContainerProps: tableContainerProps,
  sx,
  paperVariant = 'outlined',
  getRowId,
}: BiampTableProps<TData>) {
  // Internal state for uncontrolled usage
  const [sortingInternal, setSortingInternal] = useState<SortingState>([]);
  const [rowSelectionInternal, setRowSelectionInternal] =
    useState<RowSelectionState>({});
  const [columnVisibilityInternal, setColumnVisibilityInternal] =
    useState<VisibilityState>({});

  // Column visibility menu anchor
  const [menuAnchorEl, setMenuAnchorEl] = useState<HTMLElement | null>(null);

  const table = useReactTable({
    data,
    columns,
    getRowId,
    getCoreRowModel: getCoreRowModel(),

    // Sorting
    ...(enableSorting && {
      getSortedRowModel: getSortedRowModel(),
      onSortingChange: onSortingChange ?? setSortingInternal,
    }),

    // Pagination
    ...(enablePagination && {
      getPaginationRowModel: getPaginationRowModel(),
    }),

    // Row selection
    ...(enableRowSelection && {
      enableRowSelection: true,
      onRowSelectionChange: onRowSelectionChange ?? setRowSelectionInternal,
    }),

    // Column visibility
    ...(enableColumnVisibility && {
      onColumnVisibilityChange:
        onColumnVisibilityChange ?? setColumnVisibilityInternal,
    }),

    // Merged state
    state: {
      ...(enableSorting && {
        sorting: sortingProp ?? sortingInternal,
      }),
      ...(enableRowSelection && {
        rowSelection: rowSelectionProp ?? rowSelectionInternal,
      }),
      ...(enableColumnVisibility && {
        columnVisibility: columnVisibilityProp ?? columnVisibilityInternal,
      }),
    },

    initialState: {
      ...(enablePagination && {
        pagination: { pageSize: rowsPerPageOptions?.[0] ?? 25, pageIndex: 0 },
      }),
    },
  });

  return (
    <TableContainer
      component={Paper}
      variant={paperVariant}
      {...tableContainerProps}
      sx={{ ...sx }}
    >
      {enableColumnVisibility && (
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', p: 1 }}>
          <Button
            size="small"
            onClick={(e) => setMenuAnchorEl(e.currentTarget)}
          >
            Columns
          </Button>
          <Menu
            anchorEl={menuAnchorEl}
            open={Boolean(menuAnchorEl)}
            onClose={() => setMenuAnchorEl(null)}
          >
            {table.getAllLeafColumns().map((column) => (
              <MenuItem
                key={column.id}
                onClick={column.getToggleVisibilityHandler()}
              >
                <Checkbox checked={column.getIsVisible()} size="small" />
                <ListItemText>
                  {typeof column.columnDef.header === 'string'
                    ? column.columnDef.header
                    : column.id}
                </ListItemText>
              </MenuItem>
            ))}
          </Menu>
        </Box>
      )}

      <Table>
        <TableHead>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {enableRowSelection && (
                <TableCell padding="checkbox">
                  <Checkbox
                    checked={table.getIsAllPageRowsSelected()}
                    indeterminate={table.getIsSomePageRowsSelected()}
                    onChange={table.getToggleAllPageRowsSelectedHandler()}
                  />
                </TableCell>
              )}
              {headerGroup.headers.map((header) => (
                <TableCell
                  key={header.id}
                  sortDirection={
                    enableSorting ? header.column.getIsSorted() || false : false
                  }
                >
                  {header.isPlaceholder ? null : enableSorting &&
                    header.column.getCanSort() ? (
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
              ))}
            </TableRow>
          ))}
        </TableHead>

        <TableBody>
          {table.getRowModel().rows.map((row) => (
            <TableRow
              key={row.id}
              hover={!!onRowClick}
              selected={enableRowSelection ? row.getIsSelected() : undefined}
              sx={{ cursor: onRowClick ? 'pointer' : undefined }}
              onClick={() => onRowClick?.(row.original)}
            >
              {enableRowSelection && (
                <TableCell padding="checkbox">
                  <Checkbox
                    checked={row.getIsSelected()}
                    onChange={row.getToggleSelectedHandler()}
                    onClick={(e) => e.stopPropagation()}
                  />
                </TableCell>
              )}
              {row.getVisibleCells().map((cell) => (
                <TableCell key={cell.id}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {enablePagination && (
        <TablePagination
          component="div"
          count={table.getFilteredRowModel().rows.length}
          page={table.getState().pagination.pageIndex}
          rowsPerPage={table.getState().pagination.pageSize}
          onPageChange={(_, page) => table.setPageIndex(page)}
          onRowsPerPageChange={(e) => {
            table.setPageSize(Number(e.target.value));
            table.setPageIndex(0);
          }}
          rowsPerPageOptions={rowsPerPageOptions ?? []}
          showFirstButton
          showLastButton
        />
      )}
    </TableContainer>
  );
}
