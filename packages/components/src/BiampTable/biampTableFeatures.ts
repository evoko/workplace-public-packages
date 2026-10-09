import {
  type Cell,
  type CellData,
  type ColumnDef,
  type Header,
  type Row,
  type RowData,
  type Table,
  columnVisibilityFeature,
  createColumnHelper,
  createExpandedRowModel,
  createPaginatedRowModel,
  createSortedRowModel,
  rowExpandingFeature,
  rowPaginationFeature,
  rowSelectionFeature,
  rowSortingFeature,
  sortFns,
  tableFeatures,
} from '@tanstack/react-table';

/**
 * The TanStack Table v9 feature set BiampTable renders against: sorting,
 * pagination, row selection, expanding and column visibility, plus their row
 * models. Every built-in sort function is registered so `sortFn: 'auto'` and
 * string sort-function names keep working as in v8.
 *
 * Pass tables built with these features (via `useBiampTable`, or
 * `useTable({ features: biampTableFeatures, ... })`) to BiampTable components.
 */
export const biampTableFeatures = tableFeatures({
  columnVisibilityFeature,
  rowExpandingFeature,
  rowPaginationFeature,
  rowSelectionFeature,
  rowSortingFeature,
  expandedRowModel: createExpandedRowModel(),
  paginatedRowModel: createPaginatedRowModel(),
  sortedRowModel: createSortedRowModel(),
  sortFns,
});

export type BiampTableFeatures = typeof biampTableFeatures;

/** A TanStack table instance BiampTable components accept. */
export type BiampTableInstance<TData extends RowData> = Table<
  BiampTableFeatures,
  TData
>;
export type BiampRow<TData extends RowData> = Row<BiampTableFeatures, TData>;
export type BiampCell<
  TData extends RowData,
  TValue extends CellData = CellData,
> = Cell<BiampTableFeatures, TData, TValue>;
export type BiampTableHeader<
  TData extends RowData,
  TValue extends CellData = CellData,
> = Header<BiampTableFeatures, TData, TValue>;
export type BiampColumnDef<
  TData extends RowData,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  TValue extends CellData = any,
> = ColumnDef<BiampTableFeatures, TData, TValue>;

/**
 * `createColumnHelper` bound to `BiampTableFeatures`. Wrap mixed-type column
 * arrays in `helper.columns([...])` before passing them to `useBiampTable`.
 */
export function createBiampColumnHelper<TData extends RowData>() {
  return createColumnHelper<BiampTableFeatures, TData>();
}
