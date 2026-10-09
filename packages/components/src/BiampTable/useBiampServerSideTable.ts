import {
  type ColumnDef,
  type ExpandedState,
  functionalUpdate,
  type PaginationState,
  type ReactTable,
  type Row,
  type RowData,
  type RowSelectionState,
  type Updater,
} from '@tanstack/react-table';
import { useMemo } from 'react';
import { type BiampTableFeatures } from './biampTableFeatures';
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
  getNonHideableColumnIds,
  selectedIdsToRowSelection,
  rowSelectionToSelectedIds,
} from './serverSideTableUtils';
import { useBiampTable } from './useBiampTable';
import './tanstack-meta';

// Stable reference — avoid re-creating on every render.
const defaultGetRowId = (row: Record<string, string>) => row.id;

export type UseBiampServerSideTableOptions<
  TData extends RowData,
  F extends string = string,
> = {
  /** Row data array. */
  data: TData[];
  /** TanStack column definitions. Use `meta.orderField` to map columns to server-side order fields. */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  columns: ColumnDef<BiampTableFeatures, TData, any>[];
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
  enableRowSelection?:
    boolean | ((row: Row<BiampTableFeatures, TData>) => boolean);

  // ── Expanding ──────────────────────────────────────────────────
  /** Current expanded state. `{}` means nothing expanded; `true` expands all. */
  expanded?: ExpandedState;
  /** Called when the user expands/collapses rows. */
  onExpandedChange?: (expanded: ExpandedState) => void;
  /** Returns child rows for a given row (enables sub-row expanding). */
  getSubRows?: (row: TData) => TData[] | undefined;
};

/**
 * Wraps `useBiampTable` with the standard server-side configuration:
 * manual sorting, manual pagination, column visibility with dirty-tracking,
 * and optional row selection with ID-based state.
 *
 * Eliminates ~40 lines of boilerplate per table implementation.
 */
export function useBiampServerSideTable<
  TData extends RowData,
  F extends string = string,
>({
  data,
  columns,
  getRowId = defaultGetRowId as (row: TData) => string,
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
  expanded,
  onExpandedChange,
  getSubRows,
}: UseBiampServerSideTableOptions<TData, F>): ReactTable<
  BiampTableFeatures,
  TData
> {
  // ── Derived state (memoized) ─────────────────────────────────────

  const {
    defaultColumnVisibility,
    nonHideableColumnIds,
    columnIdToField,
    fieldToColumnId,
  } = useMemo(
    () => ({
      defaultColumnVisibility: getDefaultColumnVisibilityFromDefs(columns),
      nonHideableColumnIds: getNonHideableColumnIds(columns),
      ...getOrderFieldMappings<F>(columns),
    }),
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

  const mergedVisibility = useMemo(() => {
    const merged: ColumnVisibility = {
      ...defaultColumnVisibility,
      ...columnVisibility,
    };
    // Non-hideable columns (`enableHiding: false`) can never be hidden, even by
    // stale persisted state — force them visible.
    for (const id of nonHideableColumnIds) {
      merged[id] = true;
    }
    return toVisibilityState(merged);
  }, [defaultColumnVisibility, columnVisibility, nonHideableColumnIds]);

  // ── Table instance ───────────────────────────────────────────────

  return useBiampTable<TData>({
    data,
    columns,
    getRowId,

    // Server-side tables manage their own state — disable TanStack's auto-reset
    // heuristic which watches for data reference changes and resets page index,
    // selection, etc. With unstable data references (e.g. `items ?? []`) this
    // causes infinite re-render loops.
    autoResetAll: false,

    // Sorting — always manual for server-side tables
    manualSorting: true,
    sortDescFirst: false,
    state: {
      sorting,
      ...(pagination && { pagination }),
      columnVisibility: mergedVisibility,
      ...(rowSelection && { rowSelection }),
      ...(expanded != null && { expanded }),
    },
    onSortingChange: onOrderChange
      ? (updater) =>
          onOrderChange(
            sortingToOrder(functionalUpdate(updater, sorting), columnIdToField),
          )
      : undefined,

    // Pagination — manual only when page/rowsPerPage are provided; otherwise
    // useBiampTable renders every row.
    ...(hasPagination && {
      manualPagination: true,
      rowCount: rowCount ?? 0,
      onPaginationChange: onPageChange
        ? (updater: Updater<PaginationState>) =>
            onPageChange(functionalUpdate(updater, pagination!).pageIndex)
        : undefined,
    }),

    // Column visibility
    onColumnVisibilityChange: onColumnVisibilityChange
      ? (updater) => {
          const next = functionalUpdate(updater, mergedVisibility);
          const dirty = getDirtyColumnVisibility(next, defaultColumnVisibility);
          // Never persist non-hideable columns — they are always visible.
          for (const id of nonHideableColumnIds) {
            delete dirty[id];
          }
          onColumnVisibilityChange(dirty);
        }
      : undefined,

    // Row selection — only when selectedRowIds is provided
    ...(hasSelection && {
      enableRowSelection: enableRowSelection ?? true,
      onRowSelectionChange: onSelectedRowIdsChange
        ? (updater: Updater<RowSelectionState>) =>
            onSelectedRowIdsChange(
              rowSelectionToSelectedIds(
                functionalUpdate(updater, rowSelection!),
              ),
            )
        : undefined,
    }),

    // Expanding — only when expanded state is provided. Unless both expanded
    // state and getSubRows are provided, the expanded row model is skipped
    // (manualExpanding) so it doesn't recompute on every state change, matching
    // v8's conditional getExpandedRowModel. Always set explicitly: v9 merges
    // options into the previous ones, so a dropped key would go stale.
    manualExpanding: !(expanded != null && getSubRows),
    ...(expanded != null && {
      ...(getSubRows && { getSubRows }),
      onExpandedChange: onExpandedChange
        ? (updater: Updater<ExpandedState>) =>
            onExpandedChange(functionalUpdate(updater, expanded))
        : undefined,
    }),
  });
}
