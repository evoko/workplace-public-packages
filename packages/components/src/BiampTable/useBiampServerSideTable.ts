import {
  type ColumnDef,
  getCoreRowModel,
  type Row,
  type Table,
  useReactTable,
} from '@tanstack/react-table';
import { useMemo } from 'react';
import {
  toVisibilityState,
  type ColumnVisibility,
} from './BiampTableColumnVisibility';
import {
  type ServerSideOrder,
  orderToSorting,
  sortingToOrder,
  getOrderFieldMappings,
  getDefaultColumnVisibilityFromDefs,
  getDirtyColumnVisibility,
  selectedIdsToRowSelection,
  rowSelectionToSelectedIds,
} from './serverSideTableUtils';
import './tanstack-meta';

// Stable reference — avoids re-creating the row model factory on every render.
const coreRowModel = getCoreRowModel();

export type UseBiampServerSideTableOptions<TData, F extends string = string> = {
  /** Row data array. */
  data: TData[];
  /** TanStack column definitions. Use `meta.orderField` to map columns to server-side order fields. */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  columns: ColumnDef<TData, any>[];
  /** Extracts a unique ID from each row. @default `(row) => (row as any).id` */
  getRowId?: (row: TData) => string;

  // ── Sorting ──────────────────────────────────────────────────────
  /** Current server-side order. `undefined` means no sorting. */
  order?: ServerSideOrder<F>;
  /** Called when the user changes sorting. `undefined` means sorting was cleared. */
  onOrderChange?: (order?: ServerSideOrder<F>) => void;

  // ── Pagination ───────────────────────────────────────────────────
  /** Zero-based page index. */
  page?: number;
  /** Number of rows per page. */
  rowsPerPage?: number;
  /** Called when the user changes page. */
  onPageChange?: (page: number) => void;
  /** Total row count from the server (for pagination display). */
  rowCount?: number;

  // ── Column visibility ────────────────────────────────────────────
  /** Current column visibility overrides. Merged with defaults from `meta.defaultVisible`. */
  columnVisibility?: ColumnVisibility;
  /** Called with only the entries that differ from defaults (for URL persistence). */
  onColumnVisibilityChange?: (visibility: ColumnVisibility) => void;

  // ── Row selection ────────────────────────────────────────────────
  /** Currently selected row IDs. */
  selectedRowIds?: string[];
  /** Called when selection changes. */
  onSelectedRowIdsChange?: (ids: string[]) => void;
  /** Enable row selection. Pass `true` for all rows, or a predicate. */
  enableRowSelection?: boolean | ((row: Row<TData>) => boolean);
};

/**
 * Wraps `useReactTable` with the standard server-side configuration:
 * manual sorting, manual pagination, column visibility with dirty-tracking,
 * and optional row selection with ID-based state.
 *
 * Eliminates ~40 lines of boilerplate per table implementation.
 */
export function useBiampServerSideTable<TData, F extends string = string>({
  data,
  columns,
  getRowId = (row) => (row as Record<string, string>).id,
  order,
  onOrderChange,
  page,
  rowsPerPage,
  onPageChange,
  rowCount,
  columnVisibility,
  onColumnVisibilityChange,
  selectedRowIds,
  onSelectedRowIdsChange,
  enableRowSelection,
}: UseBiampServerSideTableOptions<TData, F>): Table<TData> {
  // ── Derived state (memoized) ─────────────────────────────────────

  const defaultColumnVisibility = useMemo(
    () => getDefaultColumnVisibilityFromDefs(columns),
    [columns],
  );

  const { columnIdToField, fieldToColumnId } = useMemo(
    () => getOrderFieldMappings<F>(columns),
    [columns],
  );

  const sorting = useMemo(
    () => orderToSorting(order, fieldToColumnId),
    [order, fieldToColumnId],
  );

  const hasPagination = page != null && rowsPerPage != null;
  const pagination = useMemo(
    () =>
      hasPagination ? { pageIndex: page!, pageSize: rowsPerPage! } : undefined,
    [hasPagination, page, rowsPerPage],
  );

  const hasSelection = selectedRowIds != null;
  const rowSelection = useMemo(
    () =>
      hasSelection ? selectedIdsToRowSelection(selectedRowIds!) : undefined,
    [hasSelection, selectedRowIds],
  );

  const mergedVisibility = useMemo(
    () =>
      toVisibilityState({
        ...defaultColumnVisibility,
        ...columnVisibility,
      }),
    [defaultColumnVisibility, columnVisibility],
  );

  // ── Table instance ───────────────────────────────────────────────

  return useReactTable({
    data,
    columns,
    getCoreRowModel: coreRowModel,
    getRowId,

    // Sorting — always manual for server-side tables
    manualSorting: true,
    sortDescFirst: false,
    state: {
      sorting,
      ...(pagination && { pagination }),
      columnVisibility: mergedVisibility,
      ...(rowSelection && { rowSelection }),
    },
    onSortingChange: onOrderChange
      ? (updater) => {
          const next =
            typeof updater === 'function' ? updater(sorting) : updater;
          onOrderChange(sortingToOrder(next, columnIdToField));
        }
      : undefined,

    // Pagination — only when page/rowsPerPage are provided
    ...(hasPagination && {
      manualPagination: true,
      rowCount: rowCount ?? 0,
      onPaginationChange: onPageChange
        ? (
            updater: Parameters<
              NonNullable<
                Parameters<typeof useReactTable>[0]['onPaginationChange']
              >
            >[0],
          ) => {
            const next =
              typeof updater === 'function' ? updater(pagination!) : updater;
            onPageChange(next.pageIndex);
          }
        : undefined,
    }),

    // Column visibility
    onColumnVisibilityChange: onColumnVisibilityChange
      ? (updater) => {
          const next =
            typeof updater === 'function' ? updater(mergedVisibility) : updater;
          onColumnVisibilityChange(
            getDirtyColumnVisibility(next, defaultColumnVisibility),
          );
        }
      : undefined,

    // Row selection — only when selectedRowIds is provided
    ...(hasSelection && {
      enableRowSelection: enableRowSelection ?? true,
      onRowSelectionChange: onSelectedRowIdsChange
        ? (
            updater: Parameters<
              NonNullable<
                Parameters<typeof useReactTable>[0]['onRowSelectionChange']
              >
            >[0],
          ) => {
            const next =
              typeof updater === 'function' ? updater(rowSelection!) : updater;
            onSelectedRowIdsChange(rowSelectionToSelectedIds(next));
          }
        : undefined,
    }),
  });
}
