import {
  type ReactTable,
  type RowData,
  type TableOptions,
  useTable,
} from '@tanstack/react-table';
import {
  biampTableFeatures,
  type BiampTableFeatures,
} from './biampTableFeatures';
import './tanstack-meta';

export type UseBiampTableOptions<TData extends RowData> = Omit<
  TableOptions<BiampTableFeatures, TData>,
  'features'
> & {
  /**
   * Paginate rows client-side using `state.pagination` /
   * `initialState.pagination` (default page size 10). When `false`, every row
   * is rendered. An explicit `manualPagination` always wins. Pass
   * `paginate: true` when rendering `BiampTablePagination` for client-side
   * data. @default false
   */
  paginate?: boolean;
};

/**
 * `useTable` with `biampTableFeatures` built in. Accepts every TanStack table
 * option except `features`.
 */
export function useBiampTable<TData extends RowData>({
  paginate = false,
  ...options
}: UseBiampTableOptions<TData>): ReactTable<BiampTableFeatures, TData> {
  return useTable<BiampTableFeatures, TData>({
    ...options,
    features: biampTableFeatures,
    // The shared features always register the paginated row model, which
    // paginates unless pagination is manual — so "no pagination" means manual.
    manualPagination: options.manualPagination ?? !paginate,
  });
}
