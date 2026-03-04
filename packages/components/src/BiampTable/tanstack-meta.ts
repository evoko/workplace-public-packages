/* eslint-disable @typescript-eslint/no-unused-vars */
import type { RowData } from '@tanstack/react-table';

declare module '@tanstack/react-table' {
  interface ColumnMeta<TData extends RowData, TValue> {
    /** CSS min-width applied to this column's header cell. */
    minWidth?: number | string;
    /** Make this column sticky to the left or right edge of the table. */
    sticky?: 'left' | 'right';
  }
}
