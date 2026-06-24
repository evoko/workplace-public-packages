/* eslint-disable @typescript-eslint/no-unused-vars */
import type { RowData } from '@tanstack/react-table';

declare module '@tanstack/react-table' {
  interface ColumnMeta<TData extends RowData, TValue> {
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
