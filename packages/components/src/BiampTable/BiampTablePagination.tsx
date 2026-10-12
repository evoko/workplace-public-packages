import { useEffect, useState } from 'react';
import { mergeSx } from '../slotProps';
import { TablePagination, type TablePaginationProps } from '@mui/material';
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
  /** Horizontal alignment of the pagination controls. @default 'center' */
  position?: 'left' | 'center' | 'right';
} & Omit<
  TablePaginationProps<'div'>,
  | 'component'
  | 'count'
  | 'page'
  | 'rowsPerPage'
  | 'onPageChange'
  | 'onRowsPerPageChange'
  | 'rowsPerPageOptions'
  | 'position'
>;

const positionMap = {
  left: 'flex-start',
  center: 'center',
  right: 'flex-end',
};

export function BiampTablePagination<TData>({
  table,
  rowsPerPageOptions,
  loading,
  autoHide = true,
  position = 'center',
  sx,
  ...paginationProps
}: BiampTablePaginationProps<TData>) {
  const rowCount = table.getRowCount();
  const [lastRowCount, setLastRowCount] = useState(rowCount);

  // Track the last meaningful count while not loading (React's "adjust state
  // during render" pattern; the guard makes it settle in one extra pass).
  if (!loading && rowCount >= 0 && rowCount !== lastRowCount) {
    setLastRowCount(rowCount);
  }

  const stableCount = loading ? lastRowCount : rowCount;
  const { pageSize, pageIndex } = table.getState().pagination;

  // Auto-correct page when row count drops (e.g. after filtering)
  const maxPage = Math.max(0, Math.ceil(stableCount / pageSize) - 1);
  useEffect(() => {
    if (!loading && pageIndex > maxPage) {
      table.setPageIndex(maxPage);
    }
  }, [loading, pageIndex, maxPage, table]);

  // Hide when there's no data or everything fits on one page
  if (autoHide && (!stableCount || stableCount <= pageSize)) return null;

  return (
    <TablePagination
      component="div"
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
      sx={mergeSx(
        {
          display: 'flex',
          justifyContent: positionMap[position],
          height: 40,
          minHeight: 40,
          '& .MuiToolbar-root': {
            minHeight: 40,
            px: 0,
          },
        },
        sx,
      )}
      {...paginationProps}
    />
  );
}
