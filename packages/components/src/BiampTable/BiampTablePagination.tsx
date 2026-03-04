import React, { useRef } from 'react';
import { Box, TablePagination, type TablePaginationProps } from '@mui/material';
import type { Table } from '@tanstack/react-table';

export type BiampTablePaginationProps<TData> = {
  /** TanStack Table instance to connect to. */
  table: Table<TData>;
  /** Rows-per-page options. When omitted, the selector is hidden and defaults to 25. */
  rowsPerPageOptions?: number[];
  /** When true, keeps the previous row count visible instead of dropping to 0. */
  loading?: boolean;
  /** Hide pagination when all rows fit on one page. @default true */
  autoHide?: boolean;
} & Omit<
  TablePaginationProps<typeof Box>,
  | 'component'
  | 'count'
  | 'page'
  | 'rowsPerPage'
  | 'onPageChange'
  | 'onRowsPerPageChange'
  | 'rowsPerPageOptions'
>;

export function BiampTablePagination<TData>({
  table,
  rowsPerPageOptions,
  loading,
  autoHide = true,
  sx,
  ...paginationProps
}: BiampTablePaginationProps<TData>) {
  const rowCount = table.getRowCount();
  const lastRowCountRef = useRef(rowCount);

  // Update the stable count only when not loading and the count is meaningful.
  if (!loading && rowCount >= 0) {
    lastRowCountRef.current = rowCount;
  }

  const stableCount = loading ? lastRowCountRef.current : rowCount;
  const pageSize = table.getState().pagination.pageSize;

  if (autoHide && !loading && stableCount <= pageSize) return null;

  return (
    <TablePagination
      component={Box}
      count={stableCount}
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
      sx={{
        height: 40,
        minHeight: 40,
        '& .MuiToolbar-root': {
          minHeight: 40,
          px: 0,
        },
        ...sx,
      }}
      {...paginationProps}
    />
  );
}
