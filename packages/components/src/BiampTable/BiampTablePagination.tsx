import React from 'react';
import { Box, BoxProps, TablePagination } from '@mui/material';
import type { Table } from '@tanstack/react-table';

export type BiampTablePaginationProps<TData> = BoxProps & {
  /** TanStack Table instance to connect to. */
  table: Table<TData>;
  /** Rows-per-page options. When omitted, the selector is hidden and defaults to 25. */
  rowsPerPageOptions?: number[];
};

export function BiampTablePagination<TData>({
  table,
  rowsPerPageOptions,
  ...boxProps
}: BiampTablePaginationProps<TData>) {
  return (
    <Box {...boxProps}>
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
    </Box>
  );
}
