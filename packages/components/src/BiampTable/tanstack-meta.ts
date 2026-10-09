/* eslint-disable @typescript-eslint/no-unused-vars */
import type { CellData, RowData, TableFeatures } from '@tanstack/react-table';

// v9 merging requires the exact type parameters (names, variance, defaults) of
// TanStack's own `ColumnMeta` declaration.
declare module '@tanstack/react-table' {
  interface ColumnMeta<
    in out TFeatures extends TableFeatures,
    in out TData extends RowData,
    TValue extends CellData = CellData,
  > {
    /** CSS min-width applied to this column's header cell. */
    minWidth?: number | string;
    /** Make this column sticky to the left or right edge of the table. */
    sticky?: 'left' | 'right';
    /** Whether this column is visible by default. Defaults to `true` (visible). */
    defaultVisible?: boolean;
    /** Human-readable label used in the column-visibility menu when `header` is not a string. */
    columnLabel?: string;
    /** Server-side order field name associated with this column (used by `useBiampServerSideTable`). */
    orderField?: string;
    /** Set to `false` on columns with custom cell renderers (buttons, badges, etc.) to skip text truncation. Defaults to `true`. */
    truncate?: boolean;
  }
}
